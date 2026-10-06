use tauri::image::Image;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager};

use super::copy;
use super::tray_menu;
use crate::app::state::AppState;
use crate::shell::window;
use crate::support::format;
use crate::support::logging;

const TRAY_ID: &str = "token-heroes";
const TRAY_ICON: &[u8] = include_bytes!("../../icons/tray.png");

pub fn create(app: &AppHandle) -> tauri::Result<()> {
    let menu = tray_menu::build(app)?;

    TrayIconBuilder::with_id(TRAY_ID)
        .icon(Image::from_bytes(TRAY_ICON)?)
        .icon_as_template(true)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| tray_menu::on_select(app, event.id().as_ref()))
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
    refresh_balance(app);

    Ok(())
}

pub fn refresh_balance(app: &AppHandle) {
    let Some(tray) = app.tray_by_id(TRAY_ID) else {
        return;
    };
    let state = app.state::<AppState>();
    let coins = format::compact(state.wallet().balance);
    let shown = state.settings().show_balance;
    let tooltip = if shown {
        format!("{} · {coins} {}", copy::APP_NAME, copy::COINS)
    } else {
        copy::APP_NAME.to_owned()
    };

    if let Err(problem) = tray.set_tooltip(Some(&tooltip)) {
        logging::warn(&format!("could not update the tray tooltip: {problem}"));
    }
    #[cfg(target_os = "macos")]
    if let Err(problem) = tray.set_title(shown.then_some(coins.as_str())) {
        logging::warn(&format!("could not update the tray title: {problem}"));
    }
}
