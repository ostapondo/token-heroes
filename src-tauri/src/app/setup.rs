use std::error::Error;

use tauri::{App, AppHandle, Manager, RunEvent};

use super::crediting;
use crate::persistence::paths::Paths;
use crate::shell::tray;
use crate::state::AppState;
use crate::support::logging;

pub fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    let paths = Paths::resolve(&app.path().home_dir()?);

    logging::init(&paths.logs);
    logging::info("Token Heroes started");
    app.manage(AppState::load(paths));
    tray::create(app.handle())?;
    crediting::start(app.handle().clone());

    Ok(())
}

pub fn on_run_event(app: &AppHandle, event: RunEvent) {
    match event {
        RunEvent::ExitRequested {
            code: None, api, ..
        } => api.prevent_exit(),
        RunEvent::Exit => {
            if let Some(state) = app.try_state::<AppState>() {
                state.save();
            }
        }
        _ => {}
    }
}
