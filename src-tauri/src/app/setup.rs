use std::error::Error;

use tauri::{App, AppHandle, Manager, RunEvent};

use crate::app::state::AppState;
use crate::persistence::paths::Paths;
use crate::shell::tray;
use crate::support::logging;
use crate::tokens::watcher;

pub fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    let paths = Paths::resolve(&app.path().home_dir()?);

    logging::init(&paths.logs);
    logging::info("Token Heroes started");
    let state = AppState::load(paths);
    let balance = state.wallet().balance;

    app.manage(state);
    tray::create(app.handle(), balance)?;
    watcher::start(app.handle().clone());

    Ok(())
}

pub fn keep_running_in_tray(_app: &AppHandle, event: RunEvent) {
    if let RunEvent::ExitRequested {
        code: None, api, ..
    } = event
    {
        api.prevent_exit();
    }
}
