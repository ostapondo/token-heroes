use super::AppState;
use crate::economy::ledger::InsufficientCoins;
use crate::persistence::paths::Paths;
use crate::tokens::memory::{FileCursor, Reading};
use std::fs;
use std::path::{Path, PathBuf};

fn read_up_to(offset: u64) -> Reading {
    let mut reading = Reading::default();

    reading.files.insert(
        PathBuf::from("session.jsonl"),
        FileCursor {
            offset,
            running_total: None,
        },
    );
    reading
}

fn reopen(home: &Path) -> AppState {
    AppState::load(Paths::resolve(home))
}

#[test]
fn a_crash_rolls_coins_and_positions_back_together() -> std::io::Result<()> {
    let home = tempfile::tempdir()?;
    let state = reopen(home.path());

    state.credit(100, read_up_to(10));
    assert!(state.save());
    state.credit(50, read_up_to(15));
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

    state.credit(100, read_up_to(10));
    assert!(state.spend(40).is_ok());
    assert_eq!(state.spend(61), Err(InsufficientCoins));
    drop(state);

    let state = reopen(home.path());

    assert_eq!(state.wallet().balance, 60);
    assert_eq!(state.reading(), read_up_to(10));
    Ok(())
}

#[test]
fn moves_positions_from_the_old_file_into_the_ledger() -> std::io::Result<()> {
    let home = tempfile::tempdir()?;
    let paths = Paths::resolve(home.path());

    fs::create_dir_all(&paths.data)?;
    fs::write(paths.ledger(), r#"{"burned":500,"spent":100}"#)?;
    fs::write(
        paths.legacy_cursors(),
        r#"{"session.jsonl":{"offset":10,"recent_ids":["msg_1"],"last_total":0}}"#,
    )?;

    let state = reopen(home.path());
    let mut seen = state.reading().seen;

    assert_eq!(state.wallet().balance, 400);
    assert_eq!(state.reading().files, read_up_to(10).files);
    assert_eq!(seen.growth("msg_1", 500, 0), 0);
    assert!(!paths.legacy_cursors().exists());
    drop(state);

    assert_eq!(reopen(home.path()).reading().files, read_up_to(10).files);
    Ok(())
}
