use anyhow::{anyhow, Result};
use tauri::{
    AppHandle, LogicalPosition, LogicalSize, Manager, PhysicalPosition,
    PhysicalSize, WebviewUrl, WebviewWindowBuilder,
};

use crate::models::{Card, CardMode, CardPosition};

pub const MANAGER_LABEL: &str = "manager";

pub fn card_label(id: &str) -> String {
    format!("card-{id}")
}

pub fn card_id_from_label(label: &str) -> Option<String> {
    label.strip_prefix("card-").map(|s| s.to_string())
}

/// Verify that a position is visible on at least one monitor. If not, return
/// a default position centered on the primary monitor.
pub fn sanitize_position(
    app: &AppHandle,
    pos: CardPosition,
) -> Result<CardPosition> {
    let monitors = app
        .available_monitors()
        .map_err(|e| anyhow!("available_monitors: {e}"))?;

    if monitors.is_empty() {
        return Ok(pos);
    }

    let on_screen = monitors.iter().any(|m| {
        let mp = m.position();
        let ms = m.size();
        let scale = m.scale_factor();
        // Convert stored logical to physical for comparison.
        let px = (pos.x as f64 * scale) as i32;
        let py = (pos.y as f64 * scale) as i32;
        let pw = (pos.width as f64 * scale) as u32;
        // At least 60px of the window must be visible inside the monitor.
        let within_x = px >= mp.x - (pw as i32) + 60
            && px <= mp.x + ms.width as i32 - 60;
        let within_y =
            py >= mp.y && py <= mp.y + ms.height as i32 - 60;
        within_x && within_y
    });

    if on_screen {
        return Ok(pos);
    }

    // Fall back to primary monitor center.
    let primary = app
        .primary_monitor()
        .ok()
        .flatten()
        .or_else(|| monitors.into_iter().next());

    if let Some(m) = primary {
        let scale = m.scale_factor();
        let ms = m.size();
        let mp = m.position();
        let lw = pos.width as f64;
        let lh = pos.height as f64;
        let mw = ms.width as f64 / scale;
        let mh = ms.height as f64 / scale;
        let mx = mp.x as f64 / scale;
        let my = mp.y as f64 / scale;
        Ok(CardPosition {
            x: (mx + (mw - lw) / 2.0) as i32,
            y: (my + (mh - lh) / 2.0) as i32,
            width: pos.width,
            height: pos.height,
        })
    } else {
        Ok(pos)
    }
}

pub fn spawn_card_window(app: &AppHandle, card: &Card) -> Result<()> {
    let label = card_label(&card.id);
    if app.get_webview_window(&label).is_some() {
        return Ok(());
    }

    let pos = sanitize_position(app, card.position)?;
    let theme_str = serde_json::to_string(&card.theme)
        .unwrap_or_default()
        .trim_matches('"')
        .to_string();
    let url = format!("card.html?cid={}&theme={}", card.id, theme_str);
    let always_on_top = matches!(card.mode, CardMode::Pinned);
    let skip_taskbar = matches!(card.mode, CardMode::Widget);

    let min_h = if card.minimized { 48.0 } else { 260.0 };
    let win = WebviewWindowBuilder::new(
        app,
        &label,
        WebviewUrl::App(url.into()),
    )
    .title(format!("TodoPin — {}", card.title))
    .inner_size(pos.width as f64, pos.height as f64)
    .position(pos.x as f64, pos.y as f64)
    .min_inner_size(240.0, min_h)
    .decorations(false)
    .transparent(true)
    .always_on_top(always_on_top)
    .skip_taskbar(skip_taskbar)
    .resizable(true)
    .visible(false)
    .build()
    .map_err(|e| anyhow!("build card window: {e}"))?;

    if card.visible {
        let _ = win.show();
    }
    Ok(())
}

pub fn close_card_window(app: &AppHandle, card_id: &str) {
    let label = card_label(card_id);
    if let Some(w) = app.get_webview_window(&label) {
        let _ = w.close();
    }
}

pub fn hide_card_window(app: &AppHandle, card_id: &str) {
    let label = card_label(card_id);
    if let Some(w) = app.get_webview_window(&label) {
        let _ = w.hide();
    }
}

pub fn show_card_window(app: &AppHandle, card_id: &str) {
    let label = card_label(card_id);
    if let Some(w) = app.get_webview_window(&label) {
        let _ = w.show();
        let _ = w.set_focus();
    }
}

pub fn set_card_on_top(app: &AppHandle, card_id: &str, on_top: bool) {
    let label = card_label(card_id);
    if let Some(w) = app.get_webview_window(&label) {
        let _ = w.set_always_on_top(on_top);
        let _ = w.set_skip_taskbar(!on_top);
    }
}

pub fn read_window_position(
    app: &AppHandle,
    card_id: &str,
) -> Option<CardPosition> {
    let label = card_label(card_id);
    let w = app.get_webview_window(&label)?;
    let scale = w.scale_factor().ok()?;
    let pos: PhysicalPosition<i32> = w.outer_position().ok()?;
    let size: PhysicalSize<u32> = w.inner_size().ok()?;
    let lp = pos.to_logical::<f64>(scale);
    let ls = size.to_logical::<f64>(scale);
    Some(CardPosition {
        x: lp.x as i32,
        y: lp.y as i32,
        width: ls.width as u32,
        height: ls.height as u32,
    })
}

pub fn apply_position(
    app: &AppHandle,
    card_id: &str,
    pos: CardPosition,
) -> Result<()> {
    let label = card_label(card_id);
    if let Some(w) = app.get_webview_window(&label) {
        w.set_position(LogicalPosition::new(pos.x as f64, pos.y as f64))
            .map_err(|e| anyhow!("set_position: {e}"))?;
        w.set_size(LogicalSize::new(
            pos.width as f64,
            pos.height as f64,
        ))
        .map_err(|e| anyhow!("set_size: {e}"))?;
    }
    Ok(())
}

/// Apply minimize / restore to a card window. Adjusts min size so the OS
/// accepts the compact height, then resizes.
pub fn apply_minimized(
    app: &AppHandle,
    card_id: &str,
    minimized: bool,
    pos: CardPosition,
) -> Result<()> {
    let label = card_label(card_id);
    if let Some(w) = app.get_webview_window(&label) {
        let min_h = if minimized { 48.0 } else { 260.0 };
        let _ = w
            .set_min_size(Some(LogicalSize::new(240.0, min_h)))
            .map_err(|e| anyhow!("set_min_size: {e}"));
        w.set_size(LogicalSize::new(pos.width as f64, pos.height as f64))
            .map_err(|e| anyhow!("set_size: {e}"))?;
    }
    Ok(())
}
