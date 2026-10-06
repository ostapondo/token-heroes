use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder, WindowEvent};

use crate::state::AppState;
use tauri_plugin_positioner::{Position, WindowExt};

use super::copy;
use crate::support::logging;

pub const GAME_WINDOW: &str = "game";
const SIZE: (f64, f64) = (400.0, 680.0);
const REFOCUS_GRACE: Duration = Duration::from_millis(150);

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
            let app = app.clone();
            let focused = Arc::new(AtomicBool::new(false));

            window.on_window_event(move |event| {
                if let WindowEvent::Focused(now) = event {
                    focused.store(*now, Ordering::Relaxed);
                    if !now && app.state::<AppState>().settings().close_on_blur {
                        close_unless_refocused(app.clone(), Arc::clone(&focused));
                    }
                }
            });
            focus(&window);
        }
        Err(problem) => logging::error(&format!("could not open the game window: {problem}")),
    }
}

fn close_unless_refocused(app: AppHandle, focused: Arc<AtomicBool>) {
    thread::spawn(move || {
        thread::sleep(REFOCUS_GRACE);
        if focused.load(Ordering::Relaxed) {
            return;
        }
        if let Some(window) = app.get_webview_window(GAME_WINDOW) {
            close(&window);
        }
    });
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
