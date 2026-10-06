use std::collections::HashSet;
use std::fs::{self, File};
use std::io::{self, BufRead, BufReader, Seek, SeekFrom};
use std::path::{Path, PathBuf};

use super::discovery;
use super::memory::{FileCursor, LineMemory, Reading};
use super::source::TokenSource;
use super::store::{StoreSource, read_store};
use crate::support::logging;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Batch {
    pub tokens: u64,
    pub advanced: bool,
}

impl Batch {
    pub const fn and(self, other: Self) -> Self {
        Self {
            tokens: self.tokens.saturating_add(other.tokens),
            advanced: self.advanced || other.advanced,
        }
    }
}

pub struct Collector {
    sources: Vec<Box<dyn TokenSource>>,
    stores: Vec<Box<dyn StoreSource>>,
}

impl Collector {
    pub fn new(sources: Vec<Box<dyn TokenSource>>) -> Self {
        Self {
            sources,
            stores: Vec::new(),
        }
    }

    pub fn with_stores(self, stores: Vec<Box<dyn StoreSource>>) -> Self {
        Self { stores, ..self }
    }

    pub fn transcript_roots(&self) -> impl Iterator<Item = &Path> {
        self.sources.iter().map(|source| source.root())
    }

    pub fn store_folders(&self) -> impl Iterator<Item = &Path> {
        self.stores.iter().map(|store| store.root())
    }

    // Coins are the tokens burned while the game runs, so the first scan only moves every
    // position to the end of what is already on disk.
    pub fn scan(&self, reading: &mut Reading, now: u64) -> Batch {
        if reading.started_at.is_some() {
            return self.read_all(reading, now);
        }
        *reading = Reading::starting_at(now);
        self.read_all(reading, now);

        Batch {
            tokens: 0,
            advanced: true,
        }
    }

    fn read_all(&self, reading: &mut Reading, now: u64) -> Batch {
        let forgotten = self
            .stores
            .iter()
            .fold(self.forget_deleted(reading), |batch, store| {
                batch.and(read_store(store.as_ref(), reading, now))
            });

        self.sources
            .iter()
            .flat_map(|source| {
                discovery::transcripts_under(source.root())
                    .into_iter()
                    .map(move |path| (source.as_ref(), path))
            })
            .fold(forgotten, |batch, (source, path)| {
                batch.and(read_logged(source, &path, reading, now))
            })
    }

    // A database changes several of its files at once, so each store is read once per batch.
    pub fn read_changed(&self, paths: &HashSet<PathBuf>, reading: &mut Reading, now: u64) -> Batch {
        let stores = self
            .stores
            .iter()
            .filter(|store| paths.iter().any(|path| store.owns(path)))
            .fold(Batch::default(), |batch, store| {
                batch.and(read_store(store.as_ref(), reading, now))
            });

        paths.iter().fold(stores, |batch, path| {
            batch.and(self.read(path, reading, now))
        })
    }

    pub fn read(&self, path: &Path, reading: &mut Reading, now: u64) -> Batch {
        if !discovery::is_transcript(path) {
            return Batch::default();
        }

        discovery::locate(&self.sources, path).map_or_else(Batch::default, |(source, path)| {
            read_logged(source, &path, reading, now)
        })
    }

    // A root that is missing may only be unmounted; forgetting its cursors would credit its
    // whole history again when it comes back.
    fn forget_deleted(&self, reading: &mut Reading) -> Batch {
        let present: Vec<&Path> = self
            .transcript_roots()
            .filter(|root| root.exists())
            .collect();
        let before = reading.files.len();

        reading
            .files
            .retain(|path, _| path.exists() || !present.iter().any(|root| path.starts_with(root)));

        Batch {
            tokens: 0,
            advanced: reading.files.len() != before,
        }
    }
}

fn read_logged(source: &dyn TokenSource, path: &Path, reading: &mut Reading, now: u64) -> Batch {
    read_appended(source, path, reading, now).unwrap_or_else(|problem| {
        logging::warn(&format!("could not read {}: {problem}", path.display()));
        Batch::default()
    })
}

fn read_appended(
    source: &dyn TokenSource,
    path: &Path,
    reading: &mut Reading,
    now: u64,
) -> io::Result<Batch> {
    let length = fs::metadata(path)?.len();
    let Reading { files, seen, .. } = reading;
    let cursor = files.entry(path.to_path_buf()).or_default();
    let started_at = cursor.offset;

    if length < cursor.offset {
        *cursor = FileCursor::default();
    }
    if length == cursor.offset {
        return Ok(Batch {
            tokens: 0,
            advanced: cursor.offset != started_at,
        });
    }
    let mut reader = BufReader::new(File::open(path)?);
    let mut memory = LineMemory { cursor, seen, now };
    let mut line = Vec::new();
    let mut tokens = 0_u64;
    let mut unreadable = 0_usize;

    reader.seek(SeekFrom::Start(memory.cursor.offset))?;
    loop {
        line.clear();
        let read = reader.read_until(b'\n', &mut line)?;

        if read == 0 || line.last() != Some(&b'\n') {
            break;
        }
        memory.cursor.offset = memory
            .cursor
            .offset
            .saturating_add(u64::try_from(read).map_err(io::Error::other)?);
        match source.tokens_in(&String::from_utf8_lossy(&line), &mut memory) {
            Ok(found) => tokens = tokens.saturating_add(found),
            Err(_) => unreadable += 1,
        }
    }
    if unreadable > 0 {
        logging::warn(&format!(
            "skipped {unreadable} unreadable lines in {}",
            path.display()
        ));
    }

    Ok(Batch {
        tokens,
        advanced: memory.cursor.offset != started_at,
    })
}

#[cfg(test)]
#[path = "collector_tests.rs"]
mod tests;
