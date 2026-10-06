use std::path::{Path, PathBuf};
use std::time::Duration;

use rusqlite::{Connection, OpenFlags, params};

use super::memory::StoreCursor;
use super::store::StoreSource;

const DATABASE: &str = "opencode.db";
const BUSY_WAIT: Duration = Duration::from_millis(500);
// OpenCode updates a reply in place while it streams; prompts and cache reads are not burned.
const NEW_REPLIES: &str = "SELECT id, time_updated,
       coalesce(json_extract(data, '$.tokens.input'), 0)
     + coalesce(json_extract(data, '$.tokens.output'), 0)
     + coalesce(json_extract(data, '$.tokens.reasoning'), 0)
     + coalesce(json_extract(data, '$.tokens.cache.write'), 0)
  FROM message
 WHERE time_updated > ?1 AND json_extract(data, '$.role') = 'assistant'
 ORDER BY time_updated";

pub struct OpenCode {
    root: PathBuf,
}

impl OpenCode {
    pub const fn new(root: PathBuf) -> Self {
        Self { root }
    }
}

impl StoreSource for OpenCode {
    fn name(&self) -> &'static str {
        "opencode"
    }

    fn root(&self) -> &Path {
        &self.root
    }

    fn read_new(&self, cursor: &mut StoreCursor, now: u64) -> Result<u64, String> {
        let path = self.root.join(DATABASE);

        if !path.exists() {
            return Ok(0);
        }

        burned_since(&path, cursor, now).map_err(|problem| problem.to_string())
    }
}

fn burned_since(path: &Path, cursor: &mut StoreCursor, now: u64) -> rusqlite::Result<u64> {
    let flags = OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX;
    let connection = Connection::open_with_flags(path, flags)?;

    connection.busy_timeout(BUSY_WAIT)?;
    let mut statement = connection.prepare(NEW_REPLIES)?;
    let rows = statement.query_map(params![cursor.watermark], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, i64>(1)?,
            row.get::<_, i64>(2)?,
        ))
    })?;
    let mut burned = 0_u64;

    for row in rows {
        let (id, updated, tokens) = row?;
        let tokens = u64::try_from(tokens).unwrap_or(0);

        burned = burned.saturating_add(cursor.seen.growth(&id, tokens, now));
        cursor.watermark = cursor.watermark.max(updated);
    }

    Ok(burned)
}

#[cfg(test)]
#[path = "opencode_tests.rs"]
mod tests;
