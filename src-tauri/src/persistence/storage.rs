use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use serde::de::DeserializeOwned;

use crate::support::logging;

const TEMPORARY: &str = "tmp";
const BACKUP: &str = "bak";

pub fn write_json<T: Serialize>(path: &Path, value: &T) -> io::Result<()> {
    let bytes = serde_json::to_vec_pretty(value).map_err(io::Error::other)?;

    write_atomic(path, &bytes)
}

pub fn write_atomic(path: &Path, bytes: &[u8]) -> io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let temporary = sibling(path, TEMPORARY);
    let mut file = File::create(&temporary)?;

    file.write_all(bytes)?;
    file.sync_all()?;
    drop(file);
    if path.exists() {
        fs::rename(path, sibling(path, BACKUP))?;
    }

    fs::rename(&temporary, path)
}

pub fn read_json<T: DeserializeOwned>(path: &Path) -> Option<T> {
    if let Some(value) = parse(path) {
        return Some(value);
    }
    if path.exists() {
        quarantine(path);
    }
    let restored = parse(&sibling(path, BACKUP));

    if restored.is_some() {
        logging::warn(&format!("restored {} from its backup", path.display()));
    }

    restored
}

fn parse<T: DeserializeOwned>(path: &Path) -> Option<T> {
    let bytes = fs::read(path).ok()?;

    serde_json::from_slice(&bytes)
        .map_err(|problem| logging::warn(&format!("{} is unreadable: {problem}", path.display())))
        .ok()
}

fn quarantine(path: &Path) {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |since| since.as_secs());
    let target = sibling(path, &format!("broken-{seconds}"));

    if let Err(problem) = fs::rename(path, &target) {
        logging::error(&format!(
            "could not set aside {}: {problem}",
            path.display()
        ));
    }
}

fn sibling(path: &Path, suffix: &str) -> PathBuf {
    let mut name = path.as_os_str().to_owned();

    name.push(".");
    name.push(suffix);
    PathBuf::from(name)
}

#[cfg(test)]
mod tests {
    use super::{read_json, sibling, write_json};
    use std::fs;

    #[test]
    fn keeps_the_previous_version_as_a_backup() -> std::io::Result<()> {
        let folder = tempfile::tempdir()?;
        let path = folder.path().join("ledger.json");

        write_json(&path, &1_u64)?;
        write_json(&path, &2_u64)?;

        assert_eq!(read_json::<u64>(&path), Some(2));
        assert_eq!(read_json::<u64>(&sibling(&path, "bak")), Some(1));
        Ok(())
    }

    #[test]
    fn restores_the_backup_when_the_file_is_corrupt() -> std::io::Result<()> {
        let folder = tempfile::tempdir()?;
        let path = folder.path().join("save.json");

        write_json(&path, &7_u64)?;
        write_json(&path, &8_u64)?;
        fs::write(&path, b"{ not json")?;

        assert_eq!(read_json::<u64>(&path), Some(7));
        assert!(!path.exists());
        Ok(())
    }

    #[test]
    fn reads_nothing_when_no_file_exists() -> std::io::Result<()> {
        let folder = tempfile::tempdir()?;

        assert_eq!(read_json::<u64>(&folder.path().join("missing.json")), None);
        Ok(())
    }
}
