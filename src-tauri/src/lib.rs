mod commands;
mod models;
mod shortcuts;
mod state;
mod storage;
mod tray;
mod windows;

use std::sync::Arc;
use std::thread;
use std::time::Duration;

use tauri::{Emitter, Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;

use crate::state::{AppState, SharedState};
use crate::storage::Storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // When Windows launches us from the autostart registry entry the process
    // inherits `C:\Windows\System32` as its working directory, which breaks
    // WebView2's default user-data folder resolution and yields a
    // "site can't be loaded" page on first navigation. Re-anchor CWD to the
    // installed exe directory before Tauri initializes any webview.
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let _ = std::env::set_current_dir(dir);
        }
    }

    // Pin the WebView2 user-data folder to %LOCALAPPDATA% explicitly so it
    // never depends on CWD and survives autostart cold-boot races.
    #[cfg(windows)]
    if std::env::var_os("WEBVIEW2_USER_DATA_FOLDER").is_none() {
        if let Some(local) = std::env::var_os("LOCALAPPDATA") {
            let mut path = std::path::PathBuf::from(local);
            path.push("com.todopin.app");
            path.push("EBWebView");
            let _ = std::fs::create_dir_all(&path);
            std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", path);
        }
    }

    // On autostart (`--hidden`) WebView2's host process often hasn't
    // finished spinning up by the time Tauri issues its first navigation,
    // so the webview renders an ERR_CONNECTION_FAILED page. A short pause
    // gives the runtime time to be ready before any window is built.
    let launched_hidden =
        std::env::args().any(|a| a == "--hidden");
    if launched_hidden {
        thread::sleep(Duration::from_millis(1500));
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_cards,
            commands::get_card,
            commands::get_settings,
            commands::create_card,
            commands::delete_card,
            commands::set_card_title,
            commands::set_card_theme,
            commands::set_card_mode,
            commands::set_card_visible,
            commands::set_card_position,
            commands::add_todo,
            commands::toggle_todo,
            commands::update_todo_text,
            commands::delete_todo,
            commands::clear_completed,
            commands::show_all_cards,
            commands::hide_all_cards,
            commands::set_language,
            commands::set_autostart,
            commands::set_default_theme,
            commands::open_manager,
            commands::set_app_theme,
            commands::set_shortcut,
        ])
        .setup(|app| {
            // Figure out where to store JSON.
            let data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("app_data_dir: {e}"))?;
            let storage = Storage::new(&data_dir)
                .map_err(|e| format!("storage: {e}"))?;
            let shared: SharedState = Arc::new(AppState::new(storage));
            app.manage(shared.clone());

            // Background saver thread. Every 500ms check dirty flag and
            // write to disk. Keeps drag/resize from thrashing the filesystem.
            let saver_state = shared.clone();
            thread::spawn(move || loop {
                thread::sleep(Duration::from_millis(500));
                if saver_state.take_dirty() {
                    if let Err(e) = saver_state.save_now() {
                        log::error!("save failed: {e}");
                    }
                }
            });

            // Re-open previously visible card windows.
            let handle = app.handle().clone();
            let cards = shared.snapshot_cards();
            for card in cards.iter().filter(|c| c.visible) {
                if let Err(e) = windows::spawn_card_window(&handle, card) {
                    log::error!("spawn {}: {e}", card.id);
                }
            }
            for card in cards.iter().filter(|c| c.visible) {
                windows::show_card_window(&handle, &card.id);
            }

            // Set up tray.
            if let Err(e) = tray::install(&handle) {
                log::error!("tray install failed: {e}");
            }

            // Register global shortcuts.
            shortcuts::register_all(app.handle());

            // If launched with --hidden (e.g. autostart) skip showing manager.
            let args: Vec<String> = std::env::args().collect();
            let hidden = args.iter().any(|a| a == "--hidden");
            if !hidden {
                if let Some(w) = app.get_webview_window(windows::MANAGER_LABEL)
                {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            let label = window.label().to_string();
            let app = window.app_handle().clone();

            match event {
                WindowEvent::Moved(_) | WindowEvent::Resized(_) => {
                    if let Some(card_id) = windows::card_id_from_label(&label) {
                        let state: tauri::State<SharedState> = app.state();
                        if let Some(pos) =
                            windows::read_window_position(&app, &card_id)
                        {
                            state.with_data(|d| {
                                if let Some(c) = d
                                    .cards
                                    .iter_mut()
                                    .find(|c| c.id == card_id)
                                {
                                    c.position = pos;
                                }
                            });
                        }
                    }
                }
                WindowEvent::CloseRequested { api, .. } => {
                    if label == windows::MANAGER_LABEL {
                        // Hide manager window instead of quitting.
                        api.prevent_close();
                        let _ = window.hide();
                    } else if let Some(card_id) =
                        windows::card_id_from_label(&label)
                    {
                        // Hide card (still exists); use tray or manager to show again.
                        api.prevent_close();
                        let _ = window.hide();
                        let state: tauri::State<SharedState> = app.state();
                        state.with_data(|d| {
                            if let Some(c) =
                                d.cards.iter_mut().find(|c| c.id == card_id)
                            {
                                c.visible = false;
                            }
                        });
                        let _ = app.emit_to(
                            windows::MANAGER_LABEL,
                            "cards-changed",
                            (),
                        );
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running TodoPin");
}
