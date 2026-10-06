#![allow(
    clippy::needless_pass_by_value,
    reason = "Tauri hands every command argument over by value"
)]

use serde::Serialize;
use tauri::{AppHandle, Manager};
use tauri_plugin_updater::{Update, UpdaterExt};

use super::command_error::CommandError;
use crate::shell::feedback;
use crate::state::AppState;
use crate::support::logging;

#[derive(Debug, Serialize)]
pub struct UpdateOffer {
    version: String,
    notes: Option<String>,
}

async fn latest(app: &AppHandle) -> Result<Option<Update>, CommandError> {
    let updater = app.updater().map_err(unreachable_update)?;

    updater.check().await.map_err(unreachable_update)
}

fn unreachable_update(problem: impl std::fmt::Display) -> CommandError {
    logging::warn(&format!("could not check for an update: {problem}"));
    CommandError::UpdateUnreachable
}

#[tauri::command]
pub async fn check_update(app: AppHandle) -> Result<Option<UpdateOffer>, CommandError> {
    let offer = latest(&app).await?.map(|update| UpdateOffer {
        version: update.version,
        notes: update.body,
    });

    Ok(offer)
}

#[tauri::command]
pub async fn install_update(app: AppHandle) -> Result<(), CommandError> {
    let update = latest(&app).await?.ok_or(CommandError::UpdateGone)?;

    logging::info(&format!("installing version {}", update.version));
    update
        .download_and_install(|_, _| {}, || {})
        .await
        .map_err(|problem| {
            logging::error(&format!("could not install the update: {problem}"));
            CommandError::UpdateNotInstalled
        })?;
    if let Some(state) = app.try_state::<AppState>() {
        state.save();
    }

    app.restart()
}

#[tauri::command]
pub fn report_bug(app: AppHandle) -> Result<(), CommandError> {
    if feedback::open_bug_report(&app) {
        Ok(())
    } else {
        Err(CommandError::BrowserUnavailable)
    }
}
