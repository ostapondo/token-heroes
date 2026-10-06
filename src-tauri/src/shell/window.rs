use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder, WindowEvent};
use tauri_plugin_positioner::{Position, WindowExt};

use super::copy;
use crate::support::logging;

pub const GAME_WINDOW: &str = "game";
const SIZE: (f64, f64) = (400.0, 680.0);

pub fn toggle(app: &AppHandle) {
    match app.get_webview_window(GAME_WINDOW) {
        Some(window) => close(&window),
        None => show(app),
    }
}

pub fn show(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(GAME_WINDOW) {
        focus(&window);
        return;
    }
    let built = WebviewWindowBuilder::new(app, GAME_WINDOW, WebviewUrl::App("index.html".into()))
        .title(copy::APP_NAME)
        .inner_size(SIZE.0, SIZE.1)
        .resizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .build();

    match built {
        Ok(window) => {
            if window.move_window(Position::TrayCenter).is_err()
                && let Err(problem) = window.center()
            {
                logging::warn(&format!("could not place the game window: {problem}"));
            }
            let closer = window.clone();

            window.on_window_event(move |event| {
                if matches!(event, WindowEvent::Focused(false)) {
                    close(&closer);
                }
            });
            focus(&window);
        }
        Err(problem) => logging::error(&format!("could not open the game window: {problem}")),
    }
}

fn focus(window: &WebviewWindow) {
    if let Err(problem) = window.show().and_then(|()| window.set_focus()) {
        logging::warn(&format!("could not show the game window: {problem}"));
    }
}

fn close(window: &WebviewWindow) {
    if let Err(problem) = window.destroy() {
        logging::warn(&format!("could not close the game window: {problem}"));
    }
}
