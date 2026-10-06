use tauri::AppHandle;
use tauri::image::Image;
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri_plugin_autostart::ManagerExt;

use super::copy;
use crate::shell::window;
use crate::support::format;
use crate::support::logging;

const TRAY_ID: &str = "token-heroes";
const TRAY_ICON: &[u8] = include_bytes!("../../icons/tray.png");

mod menu_id {
    pub const OPEN: &str = "open";
    pub const AUTOSTART: &str = "autostart";
    pub const QUIT: &str = "quit";
}

pub fn create(app: &AppHandle, balance: u64) -> tauri::Result<()> {
    let starts_at_login = app.autolaunch().is_enabled().unwrap_or(false);
    let open = MenuItem::with_id(app, menu_id::OPEN, copy::OPEN, true, None::<&str>)?;
    let autostart = CheckMenuItem::with_id(
        app,
        menu_id::AUTOSTART,
        copy::START_AT_LOGIN,
        true,
        starts_at_login,
        None::<&str>,
    )?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, menu_id::QUIT, copy::QUIT, true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &autostart, &separator, &quit])?;

    TrayIconBuilder::with_id(TRAY_ID)
        .icon(Image::from_bytes(TRAY_ICON)?)
        .icon_as_template(true)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| on_menu(app, event.id().as_ref()))
        .on_tray_icon_event(|tray, event| {
            tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                window::toggle(tray.app_handle());
            }
        })
        .build(app)?;
    show_balance(app, balance);

    Ok(())
}

pub fn show_balance(app: &AppHandle, balance: u64) {
    let Some(tray) = app.tray_by_id(TRAY_ID) else {
        return;
    };
    let coins = format::compact(balance);
    let tooltip = format!("{} · {coins} {}", copy::APP_NAME, copy::COINS);

    if let Err(problem) = tray.set_tooltip(Some(&tooltip)) {
        logging::warn(&format!("could not update the tray tooltip: {problem}"));
    }
    #[cfg(target_os = "macos")]
    if let Err(problem) = tray.set_title(Some(&coins)) {
        logging::warn(&format!("could not update the tray title: {problem}"));
    }
}

fn on_menu(app: &AppHandle, id: &str) {
    match id {
        menu_id::OPEN => window::show(app),
        menu_id::AUTOSTART => toggle_autostart(app),
        menu_id::QUIT => app.exit(0),
        _ => logging::warn(&format!("unknown tray menu item {id}")),
    }
}

fn toggle_autostart(app: &AppHandle) {
    let launcher = app.autolaunch();
    let result = match launcher.is_enabled() {
        Ok(true) => launcher.disable(),
        Ok(false) => launcher.enable(),
        Err(problem) => Err(problem),
    };

    if let Err(problem) = result {
        logging::error(&format!("could not change start at login: {problem}"));
    }
}
