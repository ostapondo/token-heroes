use std::path::Path;

use super::collector::Batch;
use super::memory::{Reading, StoreCursor};
use crate::support::logging;

// A source that keeps its sessions in a database rather than in transcript files: it is read
// as a whole, from the cursor on, whenever one of its files in its folder changes.
pub trait StoreSource: Send {
    fn name(&self) -> &'static str;

    fn root(&self) -> &Path;

    fn owns(&self, path: &Path) -> bool;

    fn read_new(&self, cursor: &mut StoreCursor, now: u64) -> Result<u64, String>;
}

// Database sources grow a reply over minutes and may touch it again later, so their message
// memory is kept far longer than the transcripts' few seconds of overlap.
const REMEMBER_REPLIES_FOR_SECONDS: u64 = 30 * 24 * 60 * 60;

pub fn read_store(source: &dyn StoreSource, reading: &mut Reading, now: u64) -> Batch {
    let cursor = reading.stores.entry(source.name().to_owned()).or_default();
    let before = cursor.watermark;

    cursor
        .seen
        .forget_before(now.saturating_sub(REMEMBER_REPLIES_FOR_SECONDS));
    match source.read_new(cursor, now) {
        Ok(tokens) => Batch {
            tokens,
            advanced: tokens > 0 || cursor.watermark != before,
        },
        Err(problem) => {
            logging::warn(&format!("could not read {}: {problem}", source.name()));
            Batch::default()
        }
    }
}

#[cfg(test)]
#[path = "store_tests.rs"]
mod tests;
