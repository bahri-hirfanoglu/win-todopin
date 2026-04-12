use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

use crate::models::Shortcuts;
use crate::state::SharedState;

/// Register all global shortcuts from current settings.
pub fn register_all(app: &AppHandle) {
    let state: tauri::State<SharedState> = app.state();
    let shortcuts = state.data.lock().settings.shortcuts.clone();
    register_shortcuts(app, &shortcuts);
}

/// Unregister all global shortcuts, then re-register from given config.
pub fn reregister_all(app: &AppHandle, shortcuts: &Shortcuts) {
    let _ = app.global_shortcut().unregister_all();
    register_shortcuts(app, shortcuts);
}

fn register_shortcuts(app: &AppHandle, shortcuts: &Shortcuts) {
    register_one(app, &shortcuts.show_all, "show_all");
    register_one(app, &shortcuts.hide_all, "hide_all");
    register_one(app, &shortcuts.new_card, "new_card");
    register_one(app, &shortcuts.open_manager, "open_manager");
}

fn register_one(app: &AppHandle, accel: &str, action: &str) {
    if accel.is_empty() {
        return;
    }
    let shortcut: Shortcut = match accel.parse() {
        Ok(s) => s,
        Err(e) => {
            log::error!("invalid shortcut '{}': {}", accel, e);
            return;
        }
    };
    let app_handle = app.clone();
    let action_name = action.to_string();
    if let Err(e) = app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            handle_shortcut_action(&app_handle, &action_name);
        }
    }) {
        log::error!("register shortcut '{}' for {}: {}", accel, action, e);
    }
}

fn handle_shortcut_action(app: &AppHandle, action: &str) {
    match action {
        "show_all" => {
            let _ = app.emit("shortcut-action", "show_all");
            do_show_all(app);
        }
        "hide_all" => {
            let _ = app.emit("shortcut-action", "hide_all");
            do_hide_all(app);
        }
        "new_card" => {
            let _ = app.emit("shortcut-action", "new_card");
            do_new_card(app);
        }
        "open_manager" => {
            let _ = app.emit("shortcut-action", "open_manager");
            do_open_manager(app);
        }
        _ => {}
    }
}

fn do_show_all(app: &AppHandle) {
    let state: tauri::State<SharedState> = app.state();
    let cards = {
        let mut data = state.data.lock();
        for c in data.cards.iter_mut() {
            c.visible = true;
        }
        data.cards.clone()
    };
    state.mark_dirty();

    let app_for = app.clone();
    std::thread::spawn(move || {
        use crate::windows;
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
    let _ = app.emit("cards-changed", ());
}

fn do_hide_all(app: &AppHandle) {
    let state: tauri::State<SharedState> = app.state();
    let ids: Vec<String> = {
        let mut data = state.data.lock();
        for c in data.cards.iter_mut() {
            c.visible = false;
        }
        data.cards.iter().map(|c| c.id.clone()).collect()
    };
    state.mark_dirty();
    for id in ids {
        crate::windows::hide_card_window(app, &id);
    }
    let _ = app.emit("cards-changed", ());
}

fn do_new_card(app: &AppHandle) {
    let state: tauri::State<SharedState> = app.state();
    let card = {
        let mut data = state.data.lock();
        let chosen_theme = data.settings.default_theme.clone();
        let now_ts = chrono::Utc::now().timestamp_millis();
        let offset = (data.cards.len() as i32 % 6) * 24;
        let card = crate::models::Card {
            id: uuid::Uuid::new_v4().to_string(),
            title: String::new(),
            theme: chosen_theme,
            mode: crate::models::CardMode::Pinned,
            todos: Vec::new(),
            position: crate::models::CardPosition {
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

    let app_for = app.clone();
    std::thread::spawn(move || {
        if let Err(e) = crate::windows::spawn_card_window(&app_for, &card) {
            eprintln!("[win-todopin] spawn FAILED: {e}");
        } else {
            crate::windows::show_card_window(&app_for, &card.id);
        }
    });
    let _ = app.emit("cards-changed", ());
}

fn do_open_manager(app: &AppHandle) {
    if let Some(w) = app.get_webview_window(crate::windows::MANAGER_LABEL) {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}
