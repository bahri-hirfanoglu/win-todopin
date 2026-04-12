use anyhow::{anyhow, Result};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

use crate::commands;
use crate::state::SharedState;
use crate::windows;

pub fn install(app: &AppHandle) -> Result<()> {
    let new_card_i =
        MenuItem::with_id(app, "new_card", "New card", true, None::<&str>)
            .map_err(|e| anyhow!("new_card: {e}"))?;
    let show_all_i =
        MenuItem::with_id(app, "show_all", "Show all cards", true, None::<&str>)
            .map_err(|e| anyhow!("show_all: {e}"))?;
    let hide_all_i =
        MenuItem::with_id(app, "hide_all", "Hide all cards", true, None::<&str>)
            .map_err(|e| anyhow!("hide_all: {e}"))?;
    let manager_i =
        MenuItem::with_id(app, "manager", "Manager…", true, None::<&str>)
            .map_err(|e| anyhow!("manager: {e}"))?;
    let sep = PredefinedMenuItem::separator(app)
        .map_err(|e| anyhow!("separator: {e}"))?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)
        .map_err(|e| anyhow!("quit: {e}"))?;

    let menu = Menu::with_items(
        app,
        &[&new_card_i, &show_all_i, &hide_all_i, &sep, &manager_i, &sep, &quit_i],
    )
    .map_err(|e| anyhow!("menu: {e}"))?;

    let icon = app
        .default_window_icon()
        .cloned()
        .ok_or_else(|| anyhow!("no default window icon bundled"))?;

    let _tray = TrayIconBuilder::with_id("main")
        .tooltip("TodoPin")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "new_card" => {
                let state: tauri::State<SharedState> = app.state();
                let _ = commands::create_card(None, app.clone(), state);
            }
            "show_all" => {
                let state: tauri::State<SharedState> = app.state();
                let _ = commands::show_all_cards(app.clone(), state);
            }
            "hide_all" => {
                let state: tauri::State<SharedState> = app.state();
                let _ = commands::hide_all_cards(app.clone(), state);
            }
            "manager" => {
                let _ = commands::open_manager(app.clone());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(w) = app.get_webview_window(windows::MANAGER_LABEL)
                {
                    let _ = w.show();
                    let _ = w.unminimize();
                    let _ = w.set_focus();
                }
            }
        })
        .build(app)
        .map_err(|e| anyhow!("build tray: {e}"))?;

    Ok(())
}
