use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Manager, Wry};
use tauri_plugin_autostart::ManagerExt;

use super::copy;
use super::feedback;
use super::tray;
use crate::shell::window;
use crate::state::AppState;
use crate::support::logging;

mod item {
    pub const SHOW_BALANCE: &str = "show-balance";
    pub const START_AT_LOGIN: &str = "start-at-login";
    pub const CLOSE_ON_BLUR: &str = "close-on-blur";
    pub const REPORT_BUG: &str = "report-bug";
    pub const OPEN: &str = "open";
    pub const QUIT: &str = "quit";
}

struct SettingChecks {
    show_balance: CheckMenuItem<Wry>,
    start_at_login: CheckMenuItem<Wry>,
    close_on_blur: CheckMenuItem<Wry>,
}

pub fn build(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let check =
        |id: &str, label: &str| CheckMenuItem::with_id(app, id, label, true, false, None::<&str>);
    let checks = SettingChecks {
        show_balance: check(item::SHOW_BALANCE, copy::SHOW_BALANCE)?,
        start_at_login: check(item::START_AT_LOGIN, copy::START_AT_LOGIN)?,
        close_on_blur: check(item::CLOSE_ON_BLUR, copy::CLOSE_ON_BLUR)?,
    };
    let report_bug =
        MenuItem::with_id(app, item::REPORT_BUG, copy::REPORT_BUG, true, None::<&str>)?;
    let open = MenuItem::with_id(app, item::OPEN, copy::OPEN, true, None::<&str>)?;
    let quit = MenuItem::with_id(app, item::QUIT, copy::QUIT, true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[
            &checks.show_balance,
            &checks.start_at_login,
            &checks.close_on_blur,
            &PredefinedMenuItem::separator(app)?,
            &report_bug,
            &open,
            &quit,
        ],
    )?;

    app.manage(checks);
    sync_checks(app);

    Ok(menu)
}

pub fn on_select(app: &AppHandle, id: &str) {
    let state = app.state::<AppState>();

    match id {
        item::SHOW_BALANCE => {
            state.update_settings(|settings| settings.show_balance = !settings.show_balance);
            tray::refresh_balance(app);
        }
        item::CLOSE_ON_BLUR => {
            state.update_settings(|settings| settings.close_on_blur = !settings.close_on_blur);
        }
        item::START_AT_LOGIN => toggle_start_at_login(app),
        item::REPORT_BUG => {
            feedback::open_bug_report(app);
        }
        item::OPEN => window::show(app),
        item::QUIT => app.exit(0),
        _ => logging::warn(&format!("unknown tray menu item {id}")),
    }
    sync_checks(app);
}

fn toggle_start_at_login(app: &AppHandle) {
    match app.autolaunch().is_enabled() {
        Ok(enabled) => set_start_at_login(app, !enabled),
        Err(problem) => logging::error(&format!("could not read start at login: {problem}")),
    }
}

pub fn set_start_at_login(app: &AppHandle, on: bool) {
    let launcher = app.autolaunch();
    let result = if on {
        launcher.enable()
    } else {
        launcher.disable()
    };

    if let Err(problem) = result {
        logging::error(&format!("could not change start at login: {problem}"));
    }
}

pub fn sync_checks(app: &AppHandle) {
    let Some(checks) = app.try_state::<SettingChecks>() else {
        return;
    };
    let settings = app.state::<AppState>().settings();
    let starts_at_login = app.autolaunch().is_enabled().unwrap_or(false);
    let wanted = [
        (&checks.show_balance, settings.show_balance),
        (&checks.start_at_login, starts_at_login),
        (&checks.close_on_blur, settings.close_on_blur),
    ];

    for (check, checked) in wanted {
        if let Err(problem) = check.set_checked(checked) {
            logging::warn(&format!("could not update a tray menu check: {problem}"));
        }
    }
}
