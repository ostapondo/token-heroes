use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock, PoisonError};
use std::time::{SystemTime, UNIX_EPOCH};

const FILE_NAME: &str = "token-heroes.log";
const MAX_BYTES: u64 = 1024 * 1024;
const KEPT_FILES: u32 = 3;
const MAX_MESSAGE_CHARS: usize = 4_000;

static LOG_FILE: OnceLock<Mutex<PathBuf>> = OnceLock::new();

#[derive(Clone, Copy)]
pub enum Level {
    Info,
    Warn,
    Error,
}

impl Level {
    const fn label(self) -> &'static str {
        match self {
            Self::Info => "INFO",
            Self::Warn => "WARN",
            Self::Error => "ERROR",
        }
    }
}

pub fn init(directory: &Path) {
    let created = fs::create_dir_all(directory);

    if LOG_FILE.set(Mutex::new(directory.join(FILE_NAME))).is_ok() {
        std::panic::set_hook(Box::new(|info| error(&format!("panic: {info}"))));
    }
    if let Err(problem) = created {
        error(&format!("could not create the log directory: {problem}"));
    }
}

pub fn info(message: &str) {
    write(Level::Info, message);
}

pub fn warn(message: &str) {
    write(Level::Warn, message);
}

pub fn error(message: &str) {
    write(Level::Error, message);
}

pub fn write(level: Level, message: &str) {
    let Some(file) = LOG_FILE.get() else { return };
    let path = file.lock().unwrap_or_else(PoisonError::into_inner);
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |since| since.as_secs());
    let text: String = message.chars().take(MAX_MESSAGE_CHARS).collect();

    rotate(&path);
    // A failing log has nowhere further to report, so the game keeps running without it.
    let _unlogged = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&*path)
        .and_then(|mut log| writeln!(log, "{seconds} {} {text}", level.label()));
}

fn rotate(path: &Path) {
    let too_big = fs::metadata(path).is_ok_and(|meta| meta.len() > MAX_BYTES);

    if !too_big {
        return;
    }
    for index in (1..KEPT_FILES).rev() {
        // Missing older generations are expected on the first rotations.
        let _absent = fs::rename(numbered(path, index), numbered(path, index + 1));
    }
    let _absent = fs::rename(path, numbered(path, 1));
}

fn numbered(path: &Path, index: u32) -> PathBuf {
    path.with_extension(format!("log.{index}"))
}
