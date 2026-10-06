use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::mpsc::{self, RecvTimeoutError};
use std::thread;
use std::time::{Duration, Instant};

use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Manager};

use super::claude::ClaudeCode;
use super::codex::Codex;
use super::collector::Collector;
use crate::app::events;
use crate::app::state::AppState;
use crate::persistence::paths::Paths;
use crate::persistence::storage;
use crate::support::logging;

const CREDIT_EVERY: Duration = Duration::from_secs(1);
const RESCAN_WITH_EVENTS: Duration = Duration::from_secs(300);
const RESCAN_WITHOUT_EVENTS: Duration = Duration::from_secs(30);
const SAVE_CURSORS_EVERY: Duration = Duration::from_secs(10);

pub fn start(app: AppHandle) {
    let spawned = thread::Builder::new()
        .name("token-watcher".into())
        .spawn(move || watch(&app));

    if let Err(problem) = spawned {
        logging::error(&format!("could not start watching transcripts: {problem}"));
    }
}

fn watch(app: &AppHandle) {
    let state = app.state::<AppState>();
    let paths = &state.paths;
    let mut collector = Collector::new(
        vec![
            Box::new(ClaudeCode::new(paths.claude_projects.clone())),
            Box::new(Codex::new(paths.codex_sessions.clone())),
        ],
        storage::read_json(&paths.cursors()).unwrap_or_default(),
    );
    let (sender, receiver) = mpsc::channel::<PathBuf>();
    let watcher = subscribe(&collector, sender);
    let rescan_every = if watcher.is_some() {
        RESCAN_WITH_EVENTS
    } else {
        RESCAN_WITHOUT_EVENTS
    };
    let mut pending = HashSet::new();
    let mut last_credit = Instant::now();
    let mut last_scan = Instant::now();
    let mut last_save = Instant::now();

    credit(app, &state, collector.scan());
    save_cursors(&mut collector, paths);

    loop {
        match receiver.recv_timeout(CREDIT_EVERY) {
            Ok(path) => {
                pending.insert(path);
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => thread::sleep(CREDIT_EVERY),
        }
        if last_credit.elapsed() < CREDIT_EVERY {
            continue;
        }
        last_credit = Instant::now();
        let mut burned = pending
            .drain()
            .fold(0_u64, |sum, path| sum.saturating_add(collector.read(&path)));

        if last_scan.elapsed() >= rescan_every {
            burned = burned.saturating_add(collector.scan());
            last_scan = Instant::now();
        }
        credit(app, &state, burned);
        if last_save.elapsed() >= SAVE_CURSORS_EVERY {
            save_cursors(&mut collector, paths);
            last_save = Instant::now();
        }
    }
}

fn subscribe(collector: &Collector, sender: mpsc::Sender<PathBuf>) -> Option<RecommendedWatcher> {
    let handler = move |result: notify::Result<Event>| match result {
        Ok(event) if matches!(event.kind, EventKind::Create(_) | EventKind::Modify(_)) => {
            for path in event.paths {
                // The receiver only disappears when the watcher thread ends with the app.
                let _closing = sender.send(path);
            }
        }
        Ok(_) => {}
        Err(problem) => logging::warn(&format!("transcript watcher error: {problem}")),
    };
    let mut watcher = match notify::recommended_watcher(handler) {
        Ok(watcher) => watcher,
        Err(problem) => {
            logging::warn(&format!("falling back to polling transcripts: {problem}"));
            return None;
        }
    };

    for root in collector.roots() {
        if root.exists()
            && let Err(problem) = watcher.watch(root, RecursiveMode::Recursive)
        {
            logging::warn(&format!("cannot watch {}: {problem}", root.display()));
        }
    }

    Some(watcher)
}

fn credit(app: &AppHandle, state: &AppState, burned: u64) {
    if burned > 0 {
        events::wallet_changed(app, state.burn(burned), burned);
    }
}

fn save_cursors(collector: &mut Collector, paths: &Paths) {
    if collector.take_dirty()
        && let Err(problem) = storage::write_json(&paths.cursors(), collector.cursors())
    {
        logging::error(&format!("could not save transcript positions: {problem}"));
    }
}
