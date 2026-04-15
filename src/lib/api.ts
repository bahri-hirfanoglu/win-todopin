import { invoke } from "@tauri-apps/api/core";
import type { AppSettings, AppTheme, Card, CardPosition, CardTheme, TodoItem } from "./types";

export const api = {
  // ---------- reads ----------
  listCards: () => invoke<Card[]>("list_cards"),
  getCard: (id: string) => invoke<Card | null>("get_card", { id }),
  getSettings: () => invoke<AppSettings>("get_settings"),

  // ---------- cards ----------
  createCard: (theme?: CardTheme) =>
    invoke<Card>("create_card", { theme: theme ?? null }),
  deleteCard: (id: string) => invoke<void>("delete_card", { id }),
  setCardTitle: (id: string, title: string) =>
    invoke<void>("set_card_title", { id, title }),
  setCardTheme: (id: string, theme: CardTheme) =>
    invoke<void>("set_card_theme", { id, theme }),
  setCardMode: (id: string, mode: "pinned" | "widget") =>
    invoke<void>("set_card_mode", { id, mode }),
  setCardVisible: (id: string, visible: boolean) =>
    invoke<void>("set_card_visible", { id, visible }),
  setCardPosition: (id: string, position: CardPosition) =>
    invoke<void>("set_card_position", { id, position }),

  // ---------- todos ----------
  addTodo: (cardId: string, text: string) =>
    invoke<TodoItem>("add_todo", { cardId, text }),
  toggleTodo: (cardId: string, todoId: string) =>
    invoke<void>("toggle_todo", { cardId, todoId }),
  updateTodoText: (cardId: string, todoId: string, text: string) =>
    invoke<void>("update_todo_text", { cardId, todoId, text }),
  deleteTodo: (cardId: string, todoId: string) =>
    invoke<void>("delete_todo", { cardId, todoId }),
  clearCompleted: (cardId: string) =>
    invoke<void>("clear_completed", { cardId }),
  reorderTodos: (cardId: string, ids: string[]) =>
    invoke<void>("reorder_todos", { cardId, ids }),
  restoreTodos: (cardId: string, items: TodoItem[]) =>
    invoke<void>("restore_todos", { cardId, items }),
  setCardMinimized: (id: string, minimized: boolean) =>
    invoke<void>("set_card_minimized", { id, minimized }),

  // ---------- global ----------
  showAllCards: () => invoke<void>("show_all_cards"),
  hideAllCards: () => invoke<void>("hide_all_cards"),
  setLanguage: (language: "tr" | "en") =>
    invoke<void>("set_language", { language }),
  setAutostart: (enabled: boolean) =>
    invoke<void>("set_autostart", { enabled }),
  setDefaultTheme: (theme: CardTheme) =>
    invoke<void>("set_default_theme", { theme }),
  setAppTheme: (theme: AppTheme) =>
    invoke<void>("set_app_theme", { theme }),
  setShortcut: (action: string, accel: string) =>
    invoke<void>("set_shortcut", { action, accel }),
  openManager: () => invoke<void>("open_manager"),
};
