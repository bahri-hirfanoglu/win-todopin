// Generates a 1024x1024 PNG using only Node built-ins.
// The icon is a rounded square with an orange→pink gradient and a white pin glyph.
// Run: node scripts/gen-icon-source.mjs
// Then: pnpm tauri icon src-tauri/app-icon.png
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SIZE = 1024;

// -------- PNG helpers --------
function crc32Table() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}
const TABLE = crc32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}
function makePng(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const stride = w * 4;
  const rows = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    rows[y * (stride + 1)] = 0; // filter: none
    rgba.copy(rows, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(rows, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// -------- Drawing helpers --------
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function mix(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}
// Signed distance to a rounded box centered at (cx,cy) with half-size (hw,hh).
function sdRoundedBox(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const dx = Math.max(qx, 0);
  const dy = Math.max(qy, 0);
  return Math.sqrt(dx * dx + dy * dy) + Math.min(Math.max(qx, qy), 0) - r;
}
function circleAlpha(px, py, cx, cy, r) {
  const d = Math.hypot(px - cx, py - cy) - r;
  return Math.min(1, Math.max(0, 0.5 - d));
}

// -------- Render icon --------
function render() {
  const w = SIZE;
  const h = SIZE;
  const rgba = Buffer.alloc(w * h * 4);

  const cx = w / 2;
  const cy = h / 2;
  const margin = w * 0.08;
  const halfW = w / 2 - margin;
  const halfH = h / 2 - margin;
  const radius = w * 0.22;

  // Gradient colors (peach → rose)
  const gFrom = [0xff, 0x8a, 0x5b];
  const gTo = [0xf0, 0x61, 0x92];

  // Inner pin: white rounded circle body + small dot below
  const pinCx = cx;
  const pinCy = cy - w * 0.02;
  const pinR = w * 0.22;
  const dotCx = cx;
  const dotCy = cy + w * 0.22;
  const dotR = w * 0.035;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Rounded box signed distance
      const d = sdRoundedBox(x, y, cx, cy, halfW, halfH, radius);
      // Anti-aliased coverage at the edge.
      const boxAlpha = Math.min(1, Math.max(0, 0.5 - d));
      if (boxAlpha <= 0) {
        rgba[i + 3] = 0;
        continue;
      }
      // Diagonal gradient (top-left to bottom-right)
      const t = (x + y) / (w + h);
      const [r, g, b] = mix(gFrom, gTo, t);

      // Soft highlight (top)
      const hi = Math.max(0, 1 - y / (h * 0.55));
      const highlight = hi * 0.18;

      let rr = Math.min(255, r + highlight * 255);
      let gg = Math.min(255, g + highlight * 255);
      let bb = Math.min(255, b + highlight * 255);

      // Pin glyph in white
      const pinA =
        Math.max(
          circleAlpha(x, y, pinCx, pinCy, pinR),
          circleAlpha(x, y, dotCx, dotCy, dotR)
        );
      // A small stem from pin down to dot
      const stemDx = Math.abs(x - cx);
      const stemA =
        y > pinCy &&
        y < dotCy &&
        stemDx < w * 0.012
          ? 1
          : 0;
      const glyphA = Math.min(1, pinA + stemA);
      if (glyphA > 0) {
        rr = lerp(rr, 255, glyphA);
        gg = lerp(gg, 255, glyphA);
        bb = lerp(bb, 255, glyphA);
      }

      rgba[i + 0] = rr;
      rgba[i + 1] = gg;
      rgba[i + 2] = bb;
      rgba[i + 3] = Math.round(boxAlpha * 255);
    }
  }
  return makePng(w, h, rgba);
}

const out = "src-tauri/app-icon.png";
mkdirSync(dirname(out), { recursive: true });
const png = render();
writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
