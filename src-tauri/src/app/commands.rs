#![allow(
    clippy::needless_pass_by_value,
    reason = "Tauri hands every command argument over by value"
)]

use serde_json::Value;
use tauri::{AppHandle, State};

use crate::app::state::AppState;
use crate::economy::ledger::Wallet;
use crate::persistence::storage;
use crate::shell::tray;
use crate::support::logging::{self, Level};

const INSUFFICIENT_COINS: &str = "insufficient-coins";
const SAVE_TOO_LARGE: &str = "save-too-large";
const SAVE_LIMIT_BYTES: usize = 1024 * 1024;

#[tauri::command]
pub fn wallet(state: State<'_, AppState>) -> Wallet {
    state.wallet()
}

#[tauri::command]
pub fn spend(app: AppHandle, state: State<'_, AppState>, amount: u64) -> Result<Wallet, String> {
    let wallet = state
        .spend(amount)
        .map_err(|_| INSUFFICIENT_COINS.to_owned())?;

    tray::refresh_balance(&app);

    Ok(wallet)
}

#[tauri::command]
pub fn load_save(state: State<'_, AppState>) -> Option<String> {
    storage::read_json::<Value>(&state.paths.save()).map(|save| save.to_string())
}

#[tauri::command]
pub fn write_save(state: State<'_, AppState>, save: &str) -> Result<(), String> {
    if save.len() > SAVE_LIMIT_BYTES {
        return Err(SAVE_TOO_LARGE.to_owned());
    }
    serde_json::from_str::<Value>(save).map_err(|problem| problem.to_string())?;
    storage::write_atomic(&state.paths.save(), save.as_bytes()).map_err(|problem| {
        logging::error(&format!("could not write the save: {problem}"));
        problem.to_string()
    })
}

#[tauri::command]
pub fn log(level: &str, message: &str) {
    let level = match level {
        "error" => Level::Error,
        "warn" => Level::Warn,
        _ => Level::Info,
    };

    logging::write(level, &format!("ui: {message}"));
}
