use super::AppState;
use crate::economy::ledger::InsufficientCoins;
use crate::persistence::paths::Paths;
use crate::tokens::burn::{Agent, Burn, Kinds, Spending};
use crate::tokens::memory::{FileCursor, Reading};
use std::path::{Path, PathBuf};

fn read_up_to(offset: u64) -> Reading {
    let mut reading = Reading::default();

    reading.files.insert(
        PathBuf::from("session.jsonl"),
        FileCursor {
            offset,
            ..FileCursor::default()
        },
    );
    reading
}

fn burned(tokens: u64) -> Spending {
    let mut spending = Spending::default();
    let usage = Kinds {
        input: tokens,
        ..Kinds::default()
    };

    spending.add(Agent::ClaudeCode, Burn::credited(usage, tokens));
    spending
}

fn reopen(home: &Path) -> AppState {
    AppState::load(Paths::resolve(home))
}

#[test]
fn a_crash_rolls_coins_and_positions_back_together() -> std::io::Result<()> {
    let home = tempfile::tempdir()?;
    let state = reopen(home.path());

    state.credit(&burned(100), read_up_to(10), 0);
    assert!(state.save());
    state.credit(&burned(50), read_up_to(15), 0);
    drop(state);

    let state = reopen(home.path());

    assert_eq!(state.wallet().burned, 100);
    assert_eq!(state.reading(), read_up_to(10));
    Ok(())
}

#[test]
fn a_spend_is_saved_at_once_with_everything_credited_before_it() -> std::io::Result<()> {
    let home = tempfile::tempdir()?;
    let state = reopen(home.path());

    state.credit(&burned(100), read_up_to(10), 0);
    assert!(state.spend(40).is_ok());
    assert_eq!(state.spend(61), Err(InsufficientCoins));
    drop(state);

    let state = reopen(home.path());

    assert_eq!(state.wallet().balance, 60);
    assert_eq!(state.reading(), read_up_to(10));
    Ok(())
}

#[test]
fn a_restart_keeps_the_coins_the_start_and_the_positions() -> std::io::Result<()> {
    let home = tempfile::tempdir()?;
    let state = reopen(home.path());
    let started = Reading {
        started_at: Some(7),
        ..read_up_to(10)
    };

    state.credit(&burned(100), started.clone(), 0);
    assert!(state.spend(30).is_ok());
    drop(state);

    let state = reopen(home.path());

    assert_eq!(state.wallet().balance, 70);
    assert_eq!(state.reading(), started);
    Ok(())
}
