#![allow(
    clippy::needless_pass_by_value,
    reason = "Tauri hands every command argument over by value"
)]

use std::path::Path;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};
use tauri_plugin_autostart::ManagerExt;

use crate::shell::{tray, tray_menu};
use crate::state::{AppState, History};
use crate::tokens::burn::Agent;
use crate::tokens::collector::transcripts_in;

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsView {
    show_balance: bool,
    close_on_blur: bool,
    start_at_login: bool,
}

#[derive(Clone, Copy, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Setting {
    ShowBalance,
    CloseOnBlur,
    StartAtLogin,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchedAgent {
    agent: Agent,
    path: String,
    found: bool,
    transcripts: Option<usize>,
}

// The history is a clone of up to 360 hourly tallies, made off the main thread.
#[tauri::command(async)]
pub fn burn_history(state: State<'_, AppState>) -> History {
    state.history()
}

#[tauri::command]
pub fn settings(app: AppHandle, state: State<'_, AppState>) -> SettingsView {
    view(&app, &state)
}

// The window and the tray menu change the same settings, so each change ticks the tray too.
#[tauri::command]
pub fn change_setting(
    app: AppHandle,
    state: State<'_, AppState>,
    setting: Setting,
    on: bool,
) -> SettingsView {
    match setting {
        Setting::ShowBalance => {
            state.update_settings(|settings| settings.show_balance = on);
            tray::refresh_balance(&app);
        }
        Setting::CloseOnBlur => {
            state.update_settings(|settings| settings.close_on_blur = on);
        }
        Setting::StartAtLogin => tray_menu::set_start_at_login(&app, on),
    }
    tray_menu::sync_checks(&app);

    view(&app, &state)
}

// Counting transcripts walks the agents' folders, so it runs off the main thread.
#[tauri::command(async)]
pub fn watched_agents(state: State<'_, AppState>) -> Vec<WatchedAgent> {
    let paths = &state.paths;
    let transcripts = |agent, root: &Path| WatchedAgent {
        agent,
        path: root.display().to_string(),
        found: root.exists(),
        transcripts: root.exists().then(|| transcripts_in(root)),
    };
    let database = |agent, file: &Path| WatchedAgent {
        agent,
        path: file.display().to_string(),
        found: file.exists(),
        transcripts: None,
    };

    vec![
        transcripts(Agent::ClaudeCode, &paths.claude_projects),
        transcripts(Agent::Codex, &paths.codex_sessions),
        transcripts(Agent::GeminiCli, &paths.gemini_sessions),
        transcripts(Agent::QwenCode, &paths.qwen_projects),
        database(Agent::OpenCode, &paths.opencode_database),
        database(Agent::KiloCode, &paths.kilo_database),
    ]
}

fn view(app: &AppHandle, state: &AppState) -> SettingsView {
    let settings = state.settings();

    SettingsView {
        show_balance: settings.show_balance,
        close_on_blur: settings.close_on_blur,
        start_at_login: app.autolaunch().is_enabled().unwrap_or(false),
    }
}
