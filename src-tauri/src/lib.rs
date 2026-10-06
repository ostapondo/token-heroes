mod app;
mod economy;
mod persistence;
mod shell;
mod support;
mod tokens;

use tauri_plugin_autostart::MacosLauncher;

use crate::app::{commands, setup};
use crate::shell::window;
use crate::support::logging;

pub fn run() {
    let built = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(
            |app, _arguments, _cwd| window::show(app),
        ))
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(setup::setup)
        .invoke_handler(tauri::generate_handler![
            commands::wallet,
            commands::spend,
            commands::load_save,
            commands::write_save,
            commands::log,
        ])
        .build(tauri::generate_context!());

    match built {
        Ok(app) => app.run(setup::keep_running_in_tray),
        Err(problem) => logging::error(&format!("Token Heroes could not start: {problem}")),
    }
}
