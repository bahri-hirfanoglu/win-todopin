import type { AppTheme } from "./types";

export interface AppThemeColors {
  // Background
  bg: string;
  bgGradient: string;
  // Surfaces (cards, panels)
  surface: string;
  surfaceBorder: string;
  surfaceHover: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  // Accent / primary button
  accent: string;
  accentHover: string;
  accentText: string;
  accentShadow: string;
  accentGradient: string;
  // Logo
  logoBg: string;
  logoShadow: string;
  // Interactive
  btnBg: string;
  btnHover: string;
  btnText: string;
  // Toggle / switch
  toggleBg: string;
  toggleActive: string;
  // Danger
  danger: string;
  dangerBg: string;
  // Misc
  scrollThumb: string;
  separator: string;
  // Splash
  splashBg: string;

  // Typography — each theme has its own voice
  font: string;
  titleFont: string;
  letterSpacing: string;
  titleWeight: string;

  // Card "chrome" — how cards are shaped and lit under this theme
  cardRadius: string;
  cardShadow: string;
  cardInnerBorder: string;
  cardBackdrop: string;
  cardGlow: string;
  // Surfaces used inside cards (menu, input bar)
  menuSurface: string;
  menuBorder: string;
  menuShadow: string;
  footSurface: string;
  footBorder: string;
  // Head button hover tint inside a card
  cardBtnHover: string;
  // Checkbox style
  checkRadius: string;
}

const JAKARTA = `"Plus Jakarta Sans Variable", "Plus Jakarta Sans", "Inter Variable", "Inter", system-ui, sans-serif`;
const INTER = `"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`;
const SPACE = `"Space Grotesk Variable", "Space Grotesk", "Plus Jakarta Sans Variable", system-ui, sans-serif`;
// macOS — prefer system SF on macOS hosts, then Inter (SF-like) on Windows
const MAC_STACK = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Inter Variable", "Inter", system-ui, sans-serif`;
// Windows — prefer Segoe UI Variable on Win11
const WIN_STACK = `"Segoe UI Variable Text", "Segoe UI Variable", "Segoe UI", "Inter Variable", "Inter", system-ui, sans-serif`;

export const appThemes: Record<AppTheme, AppThemeColors> = {
  default: {
    bg: "#fdfbff",
    bgGradient: "linear-gradient(160deg, #fdfbff 0%, #f4efff 60%, #ffeaf2 100%)",
    surface: "rgba(255, 255, 255, 0.68)",
    surfaceBorder: "rgba(155, 123, 240, 0.15)",
    surfaceHover: "rgba(255, 255, 255, 0.85)",
    text: "#2a2140",
    textSecondary: "#5c4a7a",
    textMuted: "#7a6a8f",
    accent: "#f06192",
    accentHover: "#e0507f",
    accentText: "#ffffff",
    accentShadow: "rgba(240, 97, 146, 0.35)",
    accentGradient: "linear-gradient(135deg, #ff8a5b, #f06192)",
    logoBg: "linear-gradient(135deg, #ff8a5b, #f06192 50%, #9b7bf0)",
    logoShadow: "rgba(240, 97, 146, 0.35)",
    btnBg: "rgba(255, 255, 255, 0.55)",
    btnHover: "rgba(255, 255, 255, 0.85)",
    btnText: "#5c4a7a",
    toggleBg: "rgba(155, 123, 240, 0.22)",
    toggleActive: "linear-gradient(135deg, #ff8a5b, #f06192)",
    danger: "#d23353",
    dangerBg: "rgba(255, 90, 110, 0.15)",
    scrollThumb: "rgba(0, 0, 0, 0.15)",
    separator: "rgba(155, 123, 240, 0.1)",
    splashBg: "linear-gradient(160deg, #fdfbff 0%, #f4efff 60%, #ffeaf2 100%)",

    font: JAKARTA,
    titleFont: JAKARTA,
    letterSpacing: "-0.01em",
    titleWeight: "700",

    cardRadius: "18px",
    cardShadow:
      "0 20px 50px var(--shadow), 0 2px 6px rgba(0,0,0,0.06)",
    cardInnerBorder: "inset 0 0 0 1px rgba(255,255,255,0.45)",
    cardBackdrop: "blur(0px)",
    cardGlow:
      "radial-gradient(ellipse at top, rgba(255,255,255,0.55), transparent 60%)",
    menuSurface: "rgba(255, 255, 255, 0.9)",
    menuBorder: "1px solid rgba(255,255,255,0.6)",
    menuShadow: "0 12px 30px rgba(0,0,0,0.18)",
    footSurface: "rgba(255, 255, 255, 0.55)",
    footBorder: "1px solid rgba(255,255,255,0.6)",
    cardBtnHover: "rgba(255,255,255,0.5)",
    checkRadius: "6px",
  },

  windows: {
    bg: "#f3f3f3",
    bgGradient: "linear-gradient(180deg, #f3f3f3 0%, #e8e8e8 100%)",
    surface: "rgba(255, 255, 255, 0.85)",
    surfaceBorder: "rgba(0, 0, 0, 0.08)",
    surfaceHover: "rgba(255, 255, 255, 1)",
    text: "#1a1a1a",
    textSecondary: "#444444",
    textMuted: "#6e6e6e",
    accent: "#0078d4",
    accentHover: "#106ebe",
    accentText: "#ffffff",
    accentShadow: "rgba(0, 120, 212, 0.3)",
    accentGradient: "linear-gradient(135deg, #0078d4, #005a9e)",
    logoBg: "linear-gradient(135deg, #0078d4, #005a9e)",
    logoShadow: "rgba(0, 120, 212, 0.3)",
    btnBg: "rgba(255, 255, 255, 0.7)",
    btnHover: "rgba(0, 120, 212, 0.08)",
    btnText: "#444444",
    toggleBg: "rgba(0, 0, 0, 0.1)",
    toggleActive: "linear-gradient(135deg, #0078d4, #005a9e)",
    danger: "#c42b1c",
    dangerBg: "rgba(196, 43, 28, 0.1)",
    scrollThumb: "rgba(0, 0, 0, 0.2)",
    separator: "rgba(0, 0, 0, 0.06)",
    splashBg: "linear-gradient(180deg, #f3f3f3 0%, #e8e8e8 100%)",

    font: WIN_STACK,
    titleFont: WIN_STACK,
    letterSpacing: "-0.005em",
    titleWeight: "600",

    // Mica-ish: flatter cards with thin border and subtle shadow
    cardRadius: "10px",
    cardShadow:
      "0 2px 8px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.06)",
    cardInnerBorder: "inset 0 0 0 1px rgba(255,255,255,0.8)",
    cardBackdrop: "blur(20px) saturate(125%)",
    cardGlow:
      "radial-gradient(ellipse at top, rgba(255,255,255,0.3), transparent 70%)",
    menuSurface: "rgba(249, 249, 249, 0.96)",
    menuBorder: "1px solid rgba(0,0,0,0.1)",
    menuShadow: "0 8px 24px rgba(0,0,0,0.14)",
    footSurface: "rgba(255,255,255,0.75)",
    footBorder: "1px solid rgba(0,0,0,0.08)",
    cardBtnHover: "rgba(0,0,0,0.06)",
    checkRadius: "4px",
  },

  macos: {
    bg: "#f5f5f7",
    bgGradient: "linear-gradient(180deg, #fafafa 0%, #f0f0f2 100%)",
    surface: "rgba(255, 255, 255, 0.72)",
    surfaceBorder: "rgba(0, 0, 0, 0.06)",
    surfaceHover: "rgba(255, 255, 255, 0.95)",
    text: "#1d1d1f",
    textSecondary: "#48484a",
    textMuted: "#86868b",
    accent: "#007aff",
    accentHover: "#0066d6",
    accentText: "#ffffff",
    accentShadow: "rgba(0, 122, 255, 0.25)",
    accentGradient: "linear-gradient(180deg, #42a1ff, #007aff)",
    logoBg: "linear-gradient(180deg, #42a1ff, #007aff)",
    logoShadow: "rgba(0, 122, 255, 0.25)",
    btnBg: "rgba(0, 0, 0, 0.04)",
    btnHover: "rgba(0, 0, 0, 0.08)",
    btnText: "#48484a",
    toggleBg: "rgba(0, 0, 0, 0.09)",
    toggleActive: "linear-gradient(180deg, #34c759, #30b855)",
    danger: "#ff3b30",
    dangerBg: "rgba(255, 59, 48, 0.1)",
    scrollThumb: "rgba(0, 0, 0, 0.15)",
    separator: "rgba(0, 0, 0, 0.05)",
    splashBg: "linear-gradient(180deg, #fafafa 0%, #f0f0f2 100%)",

    font: MAC_STACK,
    titleFont: MAC_STACK,
    letterSpacing: "-0.022em",
    titleWeight: "600",

    // Sheet vibrancy — generous radius, diffused shadow, subtle hairline
    cardRadius: "16px",
    cardShadow:
      "0 30px 60px -20px rgba(0,0,0,0.25), 0 10px 25px -15px rgba(0,0,0,0.15)",
    cardInnerBorder: "inset 0 0 0 0.5px rgba(255,255,255,0.7), inset 0 0 0 1px rgba(0,0,0,0.04)",
    cardBackdrop: "blur(30px) saturate(180%)",
    cardGlow:
      "radial-gradient(ellipse at top, rgba(255,255,255,0.5), transparent 55%)",
    menuSurface: "rgba(245, 245, 247, 0.85)",
    menuBorder: "1px solid rgba(0,0,0,0.08)",
    menuShadow:
      "0 20px 50px -10px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.05)",
    footSurface: "rgba(255,255,255,0.7)",
    footBorder: "1px solid rgba(0,0,0,0.06)",
    cardBtnHover: "rgba(0,0,0,0.06)",
    checkRadius: "50%",
  },

  github: {
    bg: "#0d1117",
    bgGradient: "linear-gradient(180deg, #0d1117 0%, #161b22 100%)",
    surface: "rgba(22, 27, 34, 0.9)",
    surfaceBorder: "rgba(48, 54, 61, 0.8)",
    surfaceHover: "rgba(33, 38, 45, 1)",
    text: "#e6edf3",
    textSecondary: "#8b949e",
    textMuted: "#6e7681",
    accent: "#238636",
    accentHover: "#2ea043",
    accentText: "#ffffff",
    accentShadow: "rgba(35, 134, 54, 0.35)",
    accentGradient: "linear-gradient(180deg, #2ea043, #238636)",
    logoBg: "linear-gradient(135deg, #238636, #1a7f37)",
    logoShadow: "rgba(35, 134, 54, 0.35)",
    btnBg: "rgba(110, 118, 129, 0.12)",
    btnHover: "rgba(110, 118, 129, 0.22)",
    btnText: "#8b949e",
    toggleBg: "rgba(110, 118, 129, 0.2)",
    toggleActive: "linear-gradient(135deg, #2ea043, #238636)",
    danger: "#f85149",
    dangerBg: "rgba(248, 81, 73, 0.15)",
    scrollThumb: "rgba(255, 255, 255, 0.12)",
    separator: "rgba(48, 54, 61, 0.6)",
    splashBg: "linear-gradient(180deg, #0d1117 0%, #161b22 100%)",

    font: INTER,
    titleFont: INTER,
    letterSpacing: "-0.011em",
    titleWeight: "600",

    // Flat dark: sharper radius, crisp border, minimal shadow
    cardRadius: "8px",
    cardShadow:
      "0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
    cardInnerBorder: "inset 0 0 0 1px rgba(240,246,252,0.08)",
    cardBackdrop: "blur(0px)",
    cardGlow:
      "radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent 70%)",
    menuSurface: "rgba(22, 27, 34, 0.98)",
    menuBorder: "1px solid rgba(48,54,61,0.8)",
    menuShadow: "0 16px 32px rgba(0,0,0,0.6)",
    footSurface: "rgba(22,27,34,0.6)",
    footBorder: "1px solid rgba(48,54,61,0.6)",
    cardBtnHover: "rgba(110,118,129,0.18)",
    checkRadius: "4px",
  },

  nord: {
    bg: "#2e3440",
    bgGradient: "linear-gradient(160deg, #2e3440 0%, #3b4252 100%)",
    surface: "rgba(59, 66, 82, 0.8)",
    surfaceBorder: "rgba(76, 86, 106, 0.5)",
    surfaceHover: "rgba(67, 76, 94, 1)",
    text: "#eceff4",
    textSecondary: "#d8dee9",
    textMuted: "#81a1c1",
    accent: "#88c0d0",
    accentHover: "#81b8c8",
    accentText: "#2e3440",
    accentShadow: "rgba(136, 192, 208, 0.3)",
    accentGradient: "linear-gradient(135deg, #88c0d0, #5e81ac)",
    logoBg: "linear-gradient(135deg, #88c0d0, #5e81ac)",
    logoShadow: "rgba(136, 192, 208, 0.3)",
    btnBg: "rgba(216, 222, 233, 0.08)",
    btnHover: "rgba(216, 222, 233, 0.15)",
    btnText: "#d8dee9",
    toggleBg: "rgba(216, 222, 233, 0.12)",
    toggleActive: "linear-gradient(135deg, #a3be8c, #8fbcbb)",
    danger: "#bf616a",
    dangerBg: "rgba(191, 97, 106, 0.15)",
    scrollThumb: "rgba(255, 255, 255, 0.1)",
    separator: "rgba(76, 86, 106, 0.4)",
    splashBg: "linear-gradient(160deg, #2e3440 0%, #3b4252 100%)",

    font: JAKARTA,
    titleFont: JAKARTA,
    letterSpacing: "0",
    titleWeight: "700",

    // Muted, matte, confident
    cardRadius: "12px",
    cardShadow:
      "0 16px 40px rgba(46,52,64,0.6), 0 4px 10px rgba(46,52,64,0.3)",
    cardInnerBorder: "inset 0 0 0 1px rgba(236,239,244,0.08)",
    cardBackdrop: "blur(8px)",
    cardGlow:
      "radial-gradient(ellipse at top, rgba(236,239,244,0.12), transparent 65%)",
    menuSurface: "rgba(59,66,82,0.96)",
    menuBorder: "1px solid rgba(76,86,106,0.6)",
    menuShadow: "0 14px 30px rgba(46,52,64,0.55)",
    footSurface: "rgba(67,76,94,0.55)",
    footBorder: "1px solid rgba(76,86,106,0.5)",
    cardBtnHover: "rgba(216,222,233,0.12)",
    checkRadius: "5px",
  },

  dracula: {
    bg: "#282a36",
    bgGradient: "linear-gradient(160deg, #282a36 0%, #1e1f29 100%)",
    surface: "rgba(68, 71, 90, 0.6)",
    surfaceBorder: "rgba(98, 114, 164, 0.3)",
    surfaceHover: "rgba(68, 71, 90, 0.9)",
    text: "#f8f8f2",
    textSecondary: "#bd93f9",
    textMuted: "#6272a4",
    accent: "#bd93f9",
    accentHover: "#a580e0",
    accentText: "#282a36",
    accentShadow: "rgba(189, 147, 249, 0.3)",
    accentGradient: "linear-gradient(135deg, #bd93f9, #ff79c6)",
    logoBg: "linear-gradient(135deg, #bd93f9, #ff79c6)",
    logoShadow: "rgba(189, 147, 249, 0.35)",
    btnBg: "rgba(248, 248, 242, 0.06)",
    btnHover: "rgba(248, 248, 242, 0.12)",
    btnText: "#f8f8f2",
    toggleBg: "rgba(248, 248, 242, 0.1)",
    toggleActive: "linear-gradient(135deg, #50fa7b, #8be9fd)",
    danger: "#ff5555",
    dangerBg: "rgba(255, 85, 85, 0.15)",
    scrollThumb: "rgba(255, 255, 255, 0.1)",
    separator: "rgba(98, 114, 164, 0.25)",
    splashBg: "linear-gradient(160deg, #282a36 0%, #1e1f29 100%)",

    font: SPACE,
    titleFont: SPACE,
    letterSpacing: "-0.005em",
    titleWeight: "600",

    // Neon / glow vibe
    cardRadius: "14px",
    cardShadow:
      "0 18px 40px rgba(189,147,249,0.18), 0 4px 14px rgba(40,42,54,0.6)",
    cardInnerBorder: "inset 0 0 0 1px rgba(189,147,249,0.22)",
    cardBackdrop: "blur(10px)",
    cardGlow:
      "radial-gradient(ellipse at top, rgba(189,147,249,0.2), transparent 60%)",
    menuSurface: "rgba(40,42,54,0.96)",
    menuBorder: "1px solid rgba(189,147,249,0.28)",
    menuShadow:
      "0 16px 40px rgba(189,147,249,0.2), 0 4px 10px rgba(40,42,54,0.6)",
    footSurface: "rgba(68,71,90,0.55)",
    footBorder: "1px solid rgba(189,147,249,0.25)",
    cardBtnHover: "rgba(189,147,249,0.18)",
    checkRadius: "6px",
  },
};

export const appThemeList: AppTheme[] = [
  "default",
  "windows",
  "macos",
  "github",
  "nord",
  "dracula",
];

export function applyAppTheme(theme: AppTheme): void {
  const c = appThemes[theme];
  const root = document.documentElement;
  const s = root.style;

  // Mark active theme on the document root so CSS can target
  // `html[data-app-theme="macos"]` for theme-specific tweaks.
  root.dataset.appTheme = theme;

  s.setProperty("--app-bg", c.bg);
  s.setProperty("--app-bg-gradient", c.bgGradient);
  s.setProperty("--app-surface", c.surface);
  s.setProperty("--app-surface-border", c.surfaceBorder);
  s.setProperty("--app-surface-hover", c.surfaceHover);
  s.setProperty("--app-text", c.text);
  s.setProperty("--app-text-secondary", c.textSecondary);
  s.setProperty("--app-text-muted", c.textMuted);
  s.setProperty("--app-accent", c.accent);
  s.setProperty("--app-accent-hover", c.accentHover);
  s.setProperty("--app-accent-text", c.accentText);
  s.setProperty("--app-accent-shadow", c.accentShadow);
  s.setProperty("--app-accent-gradient", c.accentGradient);
  s.setProperty("--app-logo-bg", c.logoBg);
  s.setProperty("--app-logo-shadow", c.logoShadow);
  s.setProperty("--app-btn-bg", c.btnBg);
  s.setProperty("--app-btn-hover", c.btnHover);
  s.setProperty("--app-btn-text", c.btnText);
  s.setProperty("--app-toggle-bg", c.toggleBg);
  s.setProperty("--app-toggle-active", c.toggleActive);
  s.setProperty("--app-danger", c.danger);
  s.setProperty("--app-danger-bg", c.dangerBg);
  s.setProperty("--app-scroll-thumb", c.scrollThumb);
  s.setProperty("--app-separator", c.separator);
  s.setProperty("--app-splash-bg", c.splashBg);

  // Typography
  s.setProperty("--app-font", c.font);
  s.setProperty("--app-title-font", c.titleFont);
  s.setProperty("--app-letter-spacing", c.letterSpacing);
  s.setProperty("--app-title-weight", c.titleWeight);

  // Card chrome — consumed by card.css
  s.setProperty("--card-radius", c.cardRadius);
  s.setProperty("--card-shadow", c.cardShadow);
  s.setProperty("--card-inner-border", c.cardInnerBorder);
  s.setProperty("--card-backdrop", c.cardBackdrop);
  s.setProperty("--card-glow", c.cardGlow);
  s.setProperty("--menu-surface", c.menuSurface);
  s.setProperty("--menu-border", c.menuBorder);
  s.setProperty("--menu-shadow", c.menuShadow);
  s.setProperty("--foot-surface", c.footSurface);
  s.setProperty("--foot-border", c.footBorder);
  s.setProperty("--card-btn-hover", c.cardBtnHover);
  s.setProperty("--check-radius", c.checkRadius);
}
