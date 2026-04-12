use chrono::Utc;
use tauri::{AppHandle, Emitter, Manager, State};
use uuid::Uuid;

use crate::models::{
    AppSettings, AppTheme, Card, CardMode, CardPosition, CardTheme, Language,
    TodoItem,
};
use crate::state::SharedState;
use crate::windows;

type Result<T> = std::result::Result<T, String>;

fn now() -> i64 {
    Utc::now().timestamp_millis()
}

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

fn emit_cards_changed(app: &AppHandle) {
    let _ = app.emit("cards-changed", ());
}

fn emit_card_changed(app: &AppHandle, card_id: &str) {
    let _ = app.emit("card-changed", card_id.to_string());
}

// ---------- reads ----------

#[tauri::command]
pub fn list_cards(state: State<SharedState>) -> Vec<Card> {
    state.snapshot_cards()
}

#[tauri::command]
pub fn get_card(id: String, state: State<SharedState>) -> Option<Card> {
    state.data.lock().cards.iter().find(|c| c.id == id).cloned()
}

#[tauri::command]
pub fn get_settings(state: State<SharedState>) -> AppSettings {
    state.snapshot_settings()
}

// ---------- cards ----------

#[tauri::command]
pub fn create_card(
    theme: Option<CardTheme>,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<Card> {
    let card = {
        let mut data = state.data.lock();
        let chosen_theme =
            theme.unwrap_or_else(|| data.settings.default_theme.clone());
        let now_ts = now();
        // Offset new cards so they don't stack perfectly.
        let offset = (data.cards.len() as i32 % 6) * 24;
        let card = Card {
            id: new_id(),
            title: String::new(),
            theme: chosen_theme,
            mode: CardMode::Pinned,
            todos: Vec::new(),
            position: CardPosition {
                x: 160 + offset,
                y: 140 + offset,
                width: 320,
                height: 420,
            },
            visible: true,
            created_at: now_ts,
            updated_at: now_ts,
        };
        data.cards.push(card.clone());
        card
    };
    state.mark_dirty();

    // Spawn window creation on a background thread. build() internally
    // dispatches to the event loop, which is safe from any non-main thread.
    // The command returns immediately; window appears shortly after.
    let app_for_window = app.clone();
    let card_for_window = card.clone();
    std::thread::spawn(move || {
        eprintln!("[win-todopin] spawning card window {}", card_for_window.id);
        match windows::spawn_card_window(&app_for_window, &card_for_window) {
            Ok(()) => {
                eprintln!("[win-todopin] spawned ok");
                windows::show_card_window(&app_for_window, &card_for_window.id);
            }
            Err(e) => {
                eprintln!("[win-todopin] spawn FAILED: {e}");
            }
        }
    });

    emit_cards_changed(&app);
    Ok(card)
}

#[tauri::command]
pub fn delete_card(
    id: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        d.cards.retain(|c| c.id != id);
    });
    windows::close_card_window(&app, &id);
    emit_cards_changed(&app);
    Ok(())
}

#[tauri::command]
pub fn set_card_title(
    id: String,
    title: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == id) {
            c.title = title;
            c.updated_at = now();
        }
    });
    emit_card_changed(&app, &id);
    Ok(())
}

#[tauri::command]
pub fn set_card_theme(
    id: String,
    theme: CardTheme,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == id) {
            c.theme = theme;
            c.updated_at = now();
        }
    });
    emit_card_changed(&app, &id);
    Ok(())
}

#[tauri::command]
pub fn set_card_mode(
    id: String,
    mode: CardMode,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    let on_top = matches!(mode, CardMode::Pinned);
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == id) {
            c.mode = mode;
            c.updated_at = now();
        }
    });
    windows::set_card_on_top(&app, &id, on_top);
    emit_card_changed(&app, &id);
    Ok(())
}

#[tauri::command]
pub fn set_card_visible(
    id: String,
    visible: bool,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    let card = {
        let mut data = state.data.lock();
        let c = data.cards.iter_mut().find(|c| c.id == id);
        if let Some(c) = c {
            c.visible = visible;
            c.updated_at = now();
            Some(c.clone())
        } else {
            None
        }
    };
    state.mark_dirty();

    if let Some(card) = card {
        let app_for = app.clone();
        let id_for = id.clone();
        std::thread::spawn(move || {
            if visible {
                use tauri::Manager as _;
                let label = windows::card_label(&id_for);
                if app_for.get_webview_window(&label).is_none() {
                    if let Err(e) =
                        windows::spawn_card_window(&app_for, &card)
                    {
                        eprintln!("[win-todopin] spawn FAILED: {e}");
                    }
                }
                windows::show_card_window(&app_for, &id_for);
            } else {
                windows::hide_card_window(&app_for, &id_for);
            }
        });
    }
    emit_card_changed(&app, &id);
    Ok(())
}

#[tauri::command]
pub fn set_card_position(
    id: String,
    position: CardPosition,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == id) {
            c.position = position;
            c.updated_at = now();
        }
    });
    let _ = windows::apply_position(&app, &id, position);
    Ok(())
}

// ---------- todos ----------

#[tauri::command]
pub fn add_todo(
    card_id: String,
    text: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<TodoItem> {
    let text = text.trim().to_string();
    if text.is_empty() {
        return Err("empty text".into());
    }
    let item = TodoItem {
        id: new_id(),
        text,
        done: false,
        created_at: now(),
    };
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == card_id) {
            c.todos.push(item.clone());
            c.updated_at = now();
        }
    });
    emit_card_changed(&app, &card_id);
    Ok(item)
}

#[tauri::command]
pub fn toggle_todo(
    card_id: String,
    todo_id: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == card_id) {
            if let Some(t) = c.todos.iter_mut().find(|t| t.id == todo_id) {
                t.done = !t.done;
            }
            c.updated_at = now();
        }
    });
    emit_card_changed(&app, &card_id);
    Ok(())
}

#[tauri::command]
pub fn update_todo_text(
    card_id: String,
    todo_id: String,
    text: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == card_id) {
            if let Some(t) = c.todos.iter_mut().find(|t| t.id == todo_id) {
                t.text = text;
            }
            c.updated_at = now();
        }
    });
    emit_card_changed(&app, &card_id);
    Ok(())
}

#[tauri::command]
pub fn delete_todo(
    card_id: String,
    todo_id: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == card_id) {
            c.todos.retain(|t| t.id != todo_id);
            c.updated_at = now();
        }
    });
    emit_card_changed(&app, &card_id);
    Ok(())
}

#[tauri::command]
pub fn clear_completed(
    card_id: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        if let Some(c) = d.cards.iter_mut().find(|c| c.id == card_id) {
            c.todos.retain(|t| !t.done);
            c.updated_at = now();
        }
    });
    emit_card_changed(&app, &card_id);
    Ok(())
}

// ---------- global ----------

#[tauri::command]
pub fn show_all_cards(
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    let cards: Vec<Card> = {
        let mut data = state.data.lock();
        for c in data.cards.iter_mut() {
            c.visible = true;
        }
        data.cards.clone()
    };
    state.mark_dirty();

    let app_for = app.clone();
    std::thread::spawn(move || {
        use tauri::Manager as _;
        for card in cards.iter() {
            let label = windows::card_label(&card.id);
            if app_for.get_webview_window(&label).is_none() {
                if let Err(e) = windows::spawn_card_window(&app_for, card) {
                    eprintln!("[win-todopin] spawn FAILED: {e}");
                }
            }
            windows::show_card_window(&app_for, &card.id);
        }
    });

    emit_cards_changed(&app);
    Ok(())
}

#[tauri::command]
pub fn hide_all_cards(
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    let ids: Vec<String> = {
        let mut data = state.data.lock();
        for c in data.cards.iter_mut() {
            c.visible = false;
        }
        data.cards.iter().map(|c| c.id.clone()).collect()
    };
    state.mark_dirty();
    for id in ids {
        windows::hide_card_window(&app, &id);
    }
    emit_cards_changed(&app);
    Ok(())
}

#[tauri::command]
pub fn set_language(
    language: Language,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| d.settings.language = language);
    let _ = app.emit("settings-changed", ());
    Ok(())
}

#[tauri::command]
pub fn set_autostart(
    enabled: bool,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    use tauri_plugin_autostart::ManagerExt;
    let manager = app.autolaunch();
    if enabled {
        manager
            .enable()
            .map_err(|e| format!("enable autostart: {e}"))?;
    } else {
        manager
            .disable()
            .map_err(|e| format!("disable autostart: {e}"))?;
    }
    state.with_data(|d| d.settings.autostart = enabled);
    let _ = app.emit("settings-changed", ());
    Ok(())
}

#[tauri::command]
pub fn set_default_theme(
    theme: CardTheme,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| d.settings.default_theme = theme);
    let _ = app.emit("settings-changed", ());
    Ok(())
}

#[tauri::command]
pub fn set_app_theme(
    theme: AppTheme,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| d.settings.app_theme = theme);
    let _ = app.emit("settings-changed", ());
    Ok(())
}

#[tauri::command]
pub fn set_shortcut(
    action: String,
    accel: String,
    app: AppHandle,
    state: State<SharedState>,
) -> Result<()> {
    state.with_data(|d| {
        let s = &mut d.settings.shortcuts;
        match action.as_str() {
            "show_all" => s.show_all = accel.clone(),
            "hide_all" => s.hide_all = accel.clone(),
            "new_card" => s.new_card = accel.clone(),
            "open_manager" => s.open_manager = accel.clone(),
            _ => {}
        }
    });
    let shortcuts = state.data.lock().settings.shortcuts.clone();
    crate::shortcuts::reregister_all(&app, &shortcuts);
    let _ = app.emit("settings-changed", ());
    Ok(())
}

#[tauri::command]
pub fn open_manager(app: AppHandle) -> Result<()> {
    if let Some(w) = app.get_webview_window(windows::MANAGER_LABEL) {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
    Ok(())
}
