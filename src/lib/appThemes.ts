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
}

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
  const s = document.documentElement.style;
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
}
