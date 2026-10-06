use std::collections::HashMap;
use std::path::PathBuf;

use serde::Deserialize;

use super::book::Book;
use crate::persistence::paths::Paths;
use crate::persistence::storage;
use crate::support::logging;
use crate::tokens::memory::FileCursor;

#[derive(Deserialize)]
struct LegacyCursor {
    offset: u64,
    #[serde(default)]
    recent_ids: Vec<String>,
    #[serde(default)]
    last_total: u64,
}

pub fn adopt_cursors(paths: &Paths, book: &mut Book, now: u64) -> bool {
    if !book.reading.files.is_empty() {
        return false;
    }
    let Some(legacy) =
        storage::read_json::<HashMap<PathBuf, LegacyCursor>>(&paths.legacy_cursors())
    else {
        return false;
    };

    for (path, cursor) in legacy {
        for id in &cursor.recent_ids {
            book.reading.seen.already_counted(id, now);
        }
        book.reading.files.insert(
            path,
            FileCursor {
                offset: cursor.offset,
                running_total: (cursor.last_total > 0).then_some(cursor.last_total),
            },
        );
    }
    logging::info("moved transcript positions into the ledger");

    true
}

pub fn retire_cursors(paths: &Paths) {
    if let Err(problem) = storage::remove_with_backup(&paths.legacy_cursors()) {
        logging::warn(&format!(
            "could not remove the old positions file: {problem}"
        ));
    }
}
