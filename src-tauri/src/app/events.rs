use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::economy::ledger::Wallet;
use crate::shell::tray;
use crate::support::logging;

pub const WALLET_CHANGED: &str = "wallet-changed";

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct WalletChange {
    wallet: Wallet,
    burned_now: u64,
}

pub fn wallet_changed(app: &AppHandle, wallet: Wallet, burned_now: u64) {
    tray::refresh_balance(app);
    if let Err(problem) = app.emit(WALLET_CHANGED, WalletChange { wallet, burned_now }) {
        logging::warn(&format!("could not announce the wallet: {problem}"));
    }
}
