import type { CardTheme } from "./types";

export interface ThemeColors {
  bgFrom: string;
  bgTo: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  shadow: string;
}

export const themes: Record<CardTheme, ThemeColors> = {
  peach: {
    bgFrom: "#FFE4D6",
    bgTo: "#FFC8A8",
    accent: "#FF8A5B",
    accentSoft: "#FFD4BD",
    text: "#4A2C1A",
    textMuted: "#9C6B52",
    shadow: "rgba(255, 138, 91, 0.35)",
  },
  lavender: {
    bgFrom: "#EDE4FF",
    bgTo: "#D4C2FF",
    accent: "#9B7BF0",
    accentSoft: "#E0D2FF",
    text: "#2E1F4D",
    textMuted: "#7A6AA0",
    shadow: "rgba(155, 123, 240, 0.35)",
  },
  mint: {
    bgFrom: "#D8F5E3",
    bgTo: "#A8E6C1",
    accent: "#4FBE7F",
    accentSoft: "#C6EFD4",
    text: "#1F4030",
    textMuted: "#5F8970",
    shadow: "rgba(79, 190, 127, 0.35)",
  },
  sky: {
    bgFrom: "#DCEEFF",
    bgTo: "#B4DBFF",
    accent: "#5BA6F2",
    accentSoft: "#CFE3FB",
    text: "#1C3352",
    textMuted: "#6A8BAD",
    shadow: "rgba(91, 166, 242, 0.35)",
  },
  sunny: {
    bgFrom: "#FFF4C2",
    bgTo: "#FFE382",
    accent: "#F5B800",
    accentSoft: "#FFE99A",
    text: "#4A3500",
    textMuted: "#9C8030",
    shadow: "rgba(245, 184, 0, 0.35)",
  },
  rose: {
    bgFrom: "#FFD9E5",
    bgTo: "#FFB3CE",
    accent: "#F06192",
    accentSoft: "#FFC6D8",
    text: "#4A1E2D",
    textMuted: "#9C5670",
    shadow: "rgba(240, 97, 146, 0.35)",
  },
  slate: {
    bgFrom: "#E8ECF1",
    bgTo: "#C7CFDA",
    accent: "#6B7A90",
    accentSoft: "#D8DEE8",
    text: "#1F2933",
    textMuted: "#6A7580",
    shadow: "rgba(107, 122, 144, 0.35)",
  },
};

export const themeList: CardTheme[] = [
  "peach",
  "lavender",
  "mint",
  "sky",
  "sunny",
  "rose",
  "slate",
];

export function applyThemeVars(
  element: HTMLElement,
  theme: CardTheme
): void {
  const c = themes[theme];
  element.style.setProperty("--bg-from", c.bgFrom);
  element.style.setProperty("--bg-to", c.bgTo);
  element.style.setProperty("--accent", c.accent);
  element.style.setProperty("--accent-soft", c.accentSoft);
  element.style.setProperty("--text", c.text);
  element.style.setProperty("--text-muted", c.textMuted);
  element.style.setProperty("--shadow", c.shadow);
}
