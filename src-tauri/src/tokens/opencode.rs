use std::path::{Path, PathBuf};
use std::time::Duration;

use rusqlite::{Connection, OpenFlags, params};

use super::burn::{Agent, Burn, Kinds};
use super::memory::StoreCursor;
use super::store::StoreSource;

const BUSY_WAIT: Duration = Duration::from_millis(500);
// OpenCode updates a reply in place while it streams; a prompt burns nothing on its own.
const NEW_REPLIES: &str = "SELECT message.id, message.time_updated,
       coalesce(json_extract(message.data, '$.tokens.input'), 0),
       coalesce(json_extract(message.data, '$.tokens.output'), 0),
       coalesce(json_extract(message.data, '$.tokens.cache.read'), 0),
       coalesce(json_extract(message.data, '$.tokens.cache.write'), 0),
       coalesce(json_extract(message.data, '$.tokens.reasoning'), 0),
       coalesce(session.version, ''),
       json_extract(message.data, '$.modelID'),
       json_extract(message.data, '$.path.cwd')
  FROM message LEFT JOIN session ON session.id = message.session_id
 WHERE message.time_updated > ?1 AND json_extract(message.data, '$.role') = 'assistant'
 ORDER BY message.time_updated";
// Before this version the output count already held the reasoning.
const REASONING_APART_SINCE: (u64, u64, u64) = (1, 3, 16);

// OpenCode and its fork Kilo Code keep every session in one SQLite database.
pub struct OpenCode {
    name: &'static str,
    agent: Agent,
    database: PathBuf,
}

impl OpenCode {
    pub const fn new(database: PathBuf) -> Self {
        Self {
            name: "opencode",
            agent: Agent::OpenCode,
            database,
        }
    }

    pub const fn kilo(database: PathBuf) -> Self {
        Self {
            name: "kilo",
            agent: Agent::KiloCode,
            database,
        }
    }
}

impl StoreSource for OpenCode {
    fn name(&self) -> &'static str {
        self.name
    }

    fn agent(&self) -> Agent {
        self.agent
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

    fn read_new(&self, cursor: &mut StoreCursor, now: u64) -> Result<Vec<Burn>, String> {
        if !self.database.exists() {
            return Ok(Vec::new());
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

struct Reply {
    id: String,
    updated: i64,
    kinds: Kinds,
    reasoning: u64,
    version: String,
    model: Option<String>,
    cwd: Option<String>,
}

fn reply(row: &rusqlite::Row<'_>) -> rusqlite::Result<Reply> {
    let count = |index: usize| -> rusqlite::Result<u64> {
        Ok(u64::try_from(row.get::<_, i64>(index)?).unwrap_or(0))
    };

    Ok(Reply {
        id: row.get(0)?,
        updated: row.get(1)?,
        kinds: Kinds {
            input: count(2)?,
            output: count(3)?,
            cache_reads: count(4)?,
            cache_writes: count(5)?,
        },
        reasoning: count(6)?,
        version: row.get(7)?,
        model: row.get(8)?,
        cwd: row.get(9)?,
    })
}

fn burned_since(path: &Path, cursor: &mut StoreCursor, now: u64) -> rusqlite::Result<Vec<Burn>> {
    let flags = OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX;
    let connection = Connection::open_with_flags(path, flags)?;

    connection.busy_timeout(BUSY_WAIT)?;
    let mut statement = connection.prepare(NEW_REPLIES)?;
    let rows = statement.query_map(params![cursor.watermark], reply)?;
    let mut burns = Vec::new();

    for row in rows {
        let reply = row?;
        let kinds = if counts_reasoning_apart(&reply.version) {
            Kinds {
                output: reply.kinds.output.saturating_add(reply.reasoning),
                ..reply.kinds
            }
        } else {
            reply.kinds
        };
        let credited = cursor.seen.growth(&reply.id, kinds.total(), now);

        cursor.watermark = cursor.watermark.max(reply.updated);
        burns.push(
            Burn::credited(kinds, credited)
                .by(reply.model)
                .in_folder(reply.cwd.as_deref()),
        );
    }

    Ok(burns)
}

#[cfg(test)]
#[path = "opencode_tests.rs"]
mod tests;
