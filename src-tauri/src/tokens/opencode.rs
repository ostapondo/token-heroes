use std::path::{Path, PathBuf};
use std::time::Duration;

use rusqlite::{Connection, OpenFlags, params};

use super::memory::StoreCursor;
use super::store::StoreSource;

const BUSY_WAIT: Duration = Duration::from_millis(500);
// OpenCode updates a reply in place while it streams; a prompt burns nothing on its own.
const NEW_REPLIES: &str = "SELECT message.id, message.time_updated,
       coalesce(json_extract(message.data, '$.tokens.input'), 0)
     + coalesce(json_extract(message.data, '$.tokens.output'), 0)
     + coalesce(json_extract(message.data, '$.tokens.cache.read'), 0)
     + coalesce(json_extract(message.data, '$.tokens.cache.write'), 0),
       coalesce(json_extract(message.data, '$.tokens.reasoning'), 0),
       coalesce(session.version, '')
  FROM message LEFT JOIN session ON session.id = message.session_id
 WHERE message.time_updated > ?1 AND json_extract(message.data, '$.role') = 'assistant'
 ORDER BY message.time_updated";
// Before this version the output count already held the reasoning.
const REASONING_APART_SINCE: (u64, u64, u64) = (1, 3, 16);

// OpenCode and its fork Kilo Code keep every session in one SQLite database.
pub struct OpenCode {
    name: &'static str,
    database: PathBuf,
}

impl OpenCode {
    pub const fn new(database: PathBuf) -> Self {
        Self {
            name: "opencode",
            database,
        }
    }

    pub const fn kilo(database: PathBuf) -> Self {
        Self {
            name: "kilo",
            database,
        }
    }
}

impl StoreSource for OpenCode {
    fn name(&self) -> &'static str {
        self.name
    }

    fn root(&self) -> &Path {
        self.database.parent().unwrap_or(&self.database)
    }

    // Matched by name, not by folder: the watcher reports real paths behind a symlink.
    fn owns(&self, path: &Path) -> bool {
        let named = |path: &Path| {
            path.file_name()
                .map(|name| name.to_string_lossy().into_owned())
        };

        named(path)
            .zip(named(&self.database))
            .is_some_and(|(changed, database)| changed.starts_with(&database))
    }

    fn read_new(&self, cursor: &mut StoreCursor, now: u64) -> Result<u64, String> {
        if !self.database.exists() {
            return Ok(0);
        }

        burned_since(&self.database, cursor, now).map_err(|problem| problem.to_string())
    }
}

fn counts_reasoning_apart(version: &str) -> bool {
    let mut parts = version
        .split(['.', '-'])
        .map(|part| part.parse::<u64>().unwrap_or(0));
    let parsed = (
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
    );

    version.is_empty() || parsed >= REASONING_APART_SINCE
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
            row.get::<_, i64>(3)?,
            row.get::<_, String>(4)?,
        ))
    })?;
    let mut burned = 0_u64;

    for row in rows {
        let (id, updated, tokens, reasoning, version) = row?;
        let reasoning = if counts_reasoning_apart(&version) {
            reasoning
        } else {
            0
        };
        let tokens = u64::try_from(tokens.saturating_add(reasoning)).unwrap_or(0);

        burned = burned.saturating_add(cursor.seen.growth(&id, tokens, now));
        cursor.watermark = cursor.watermark.max(updated);
    }

    Ok(burned)
}

#[cfg(test)]
#[path = "opencode_tests.rs"]
mod tests;
