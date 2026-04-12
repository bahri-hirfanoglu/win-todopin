export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export type CardTheme =
  | "peach"
  | "lavender"
  | "mint"
  | "sky"
  | "sunny"
  | "rose"
  | "slate";

export type CardMode = "pinned" | "widget";

export interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Card {
  id: string;
  title: string;
  theme: CardTheme;
  mode: CardMode;
  todos: TodoItem[];
  position: CardPosition;
  visible: boolean;
  createdAt: number;
  updatedAt: number;
}

export type Language = "tr" | "en";

export type AppTheme =
  | "default"
  | "windows"
  | "macos"
  | "github"
  | "nord"
  | "dracula";

export interface Shortcuts {
  showAll: string;
  hideAll: string;
  newCard: string;
  openManager: string;
}

export type ShortcutAction = keyof Shortcuts;

export interface AppSettings {
  language: Language;
  autostart: boolean;
  defaultTheme: CardTheme;
  appTheme: AppTheme;
  shortcuts: Shortcuts;
}

export interface AppState {
  cards: Card[];
  settings: AppSettings;
}
