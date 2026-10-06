use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::mpsc::{self, Receiver, RecvTimeoutError};
use std::thread;
use std::time::{Duration, Instant};

use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Manager};

use crate::app::events;
use crate::state::AppState;
use crate::support::{clock, logging};
use crate::tokens::claude::ClaudeCode;
use crate::tokens::codex::Codex;
use crate::tokens::collector::{Batch, Collector};
use crate::tokens::gemini::GeminiCli;
use crate::tokens::memory::Reading;
use crate::tokens::opencode::OpenCode;
use crate::tokens::qwen::QwenCode;

const CREDIT_EVERY: Duration = Duration::from_secs(1);
const RESCAN_WITH_EVENTS: Duration = Duration::from_secs(300);
const RESCAN_WITHOUT_EVENTS: Duration = Duration::from_secs(30);
const SAVE_EVERY: Duration = Duration::from_secs(10);
// Compaction transcripts repeat a message within seconds of the original.
const REMEMBER_IDS_FOR_SECONDS: u64 = 60 * 60;

struct Crediting {
    app: AppHandle,
    collector: Collector,
    reading: Reading,
    changed: Receiver<PathBuf>,
    rescan_every: Duration,
    last_scan: Instant,
    last_save: Instant,
}

pub fn start(app: AppHandle) {
    let spawned = thread::Builder::new()
        .name("token-watcher".into())
        .spawn(move || run(&app));

    if let Err(problem) = spawned {
        logging::error(&format!("could not start watching transcripts: {problem}"));
    }
}

fn run(app: &AppHandle) {
    let state = app.state::<AppState>();
    let paths = &state.paths;
    let collector = Collector::new(vec![
        Box::new(ClaudeCode::new(paths.claude_projects.clone())),
        Box::new(Codex::new(paths.codex_sessions.clone())),
        Box::new(GeminiCli::new(paths.gemini_sessions.clone())),
        Box::new(QwenCode::new(paths.qwen_projects.clone())),
    ])
    .with_stores(vec![
        Box::new(OpenCode::new(paths.opencode_database.clone())),
        Box::new(OpenCode::kilo(paths.kilo_database.clone())),
    ]);
    let (sender, changed) = mpsc::channel();
    let watcher = subscribe(&collector, sender);
    let mut crediting = Crediting {
        reading: state.reading(),
        app: app.clone(),
        collector,
        changed,
        rescan_every: if watcher.is_some() {
            RESCAN_WITH_EVENTS
        } else {
            RESCAN_WITHOUT_EVENTS
        },
        last_scan: Instant::now(),
        last_save: Instant::now(),
    };

    crediting.scan();
    state.save();
    loop {
        crediting.tick();
    }
}

impl Crediting {
    fn scan(&mut self) {
        let now = clock::unix_seconds();
        let batch = self.collector.scan(&mut self.reading, now);

        self.last_scan = Instant::now();
        self.commit(batch, now);
    }

    fn tick(&mut self) {
        let started = Instant::now();
        let mut pending = HashSet::new();

        while let Some(wait) = CREDIT_EVERY.checked_sub(started.elapsed()) {
            match self.changed.recv_timeout(wait) {
                Ok(path) => {
                    pending.insert(path);
                }
                Err(RecvTimeoutError::Timeout) => break,
                Err(RecvTimeoutError::Disconnected) => thread::sleep(wait),
            }
        }
        let now = clock::unix_seconds();
        let batch = pending.iter().fold(Batch::default(), |batch, path| {
            batch.and(self.collector.read(path, &mut self.reading, now))
        });

        self.commit(batch, now);
        if self.last_scan.elapsed() >= self.rescan_every {
            self.scan();
        }
        if self.last_save.elapsed() >= SAVE_EVERY {
            self.app.state::<AppState>().save();
            self.last_save = Instant::now();
        }
    }

    fn commit(&mut self, batch: Batch, now: u64) {
        if !batch.advanced {
            return;
        }
        self.reading
            .seen
            .forget_before(now.saturating_sub(REMEMBER_IDS_FOR_SECONDS));
        let credited = self
            .app
            .state::<AppState>()
            .credit(batch.tokens, self.reading.clone());

        if let Some(wallet) = credited {
            events::wallet_changed(&self.app, wallet, batch.tokens);
        }
    }
}

fn subscribe(collector: &Collector, sender: mpsc::Sender<PathBuf>) -> Option<RecommendedWatcher> {
    let handler = move |result: notify::Result<Event>| match result {
        Ok(event) if matches!(event.kind, EventKind::Create(_) | EventKind::Modify(_)) => {
            for path in event.paths {
                // The receiver only disappears when the crediting thread ends with the app.
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
