#![allow(
    clippy::needless_pass_by_value,
    reason = "Tauri hands every command argument over by value"
)]

use serde_json::Value;
use tauri::{AppHandle, State};

use super::command_error::CommandError;
use crate::economy::ledger::Wallet;
use crate::persistence::storage;
use crate::shell::tray;
use crate::state::AppState;
use crate::support::logging::{self, Level};

const SAVE_LIMIT_BYTES: usize = 1024 * 1024;

#[tauri::command]
pub fn wallet(state: State<'_, AppState>) -> Wallet {
    state.wallet()
}

// A command that writes to disk runs off the main thread, which draws the game window: a full
// flush takes 4 to 11 ms on an Apple SSD at rest and longer while agents write transcripts.
#[tauri::command(async)]
pub fn spend(
    app: AppHandle,
    state: State<'_, AppState>,
    amount: u64,
) -> Result<Wallet, CommandError> {
    let wallet = state
        .spend(amount)
        .map_err(|_| CommandError::InsufficientCoins)?;

    tray::refresh_balance(&app);

    Ok(wallet)
}

#[tauri::command(async)]
pub fn load_save(state: State<'_, AppState>) -> Option<String> {
    storage::read_json::<Value>(&state.paths.save()).map(|save| save.to_string())
}

#[tauri::command(async)]
pub fn write_save(state: State<'_, AppState>, save: String) -> Result<(), CommandError> {
    if save.len() > SAVE_LIMIT_BYTES {
        return Err(CommandError::SaveTooLarge);
    }
    serde_json::from_str::<Value>(&save).map_err(|_| CommandError::SaveUnreadable)?;
    state.write_save(save.as_bytes()).map_err(|problem| {
        logging::error(&format!("could not write the save: {problem}"));
        CommandError::SaveNotWritten
    })
}

#[tauri::command(async)]
pub fn log(level: String, message: String) {
    let level = match level.as_str() {
        "error" => Level::Error,
        "warn" => Level::Warn,
        _ => Level::Info,
    };

    logging::write(level, &format!("ui: {message}"));
}
