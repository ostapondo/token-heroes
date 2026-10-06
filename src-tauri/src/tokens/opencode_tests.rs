use super::OpenCode;
use crate::tokens::memory::StoreCursor;
use crate::tokens::store::StoreSource;
use rusqlite::{Connection, params};
use std::path::PathBuf;

const REPLY: &str = r#"{"role":"assistant","tokens":{"input":100,"output":20,"reasoning":5,"cache":{"read":9000,"write":30}}}"#;
const PROMPT: &str = r#"{"role":"user"}"#;

struct Database {
    _folder: tempfile::TempDir,
    path: PathBuf,
    connection: Connection,
}

fn database(version: &str) -> Result<Database, Box<dyn std::error::Error>> {
    let folder = tempfile::tempdir()?;
    let path = folder.path().join("opencode.db");
    let connection = Connection::open(&path)?;

    connection.execute_batch(
        "CREATE TABLE session (id TEXT PRIMARY KEY, version TEXT NOT NULL);
         CREATE TABLE message (id TEXT PRIMARY KEY, session_id TEXT NOT NULL,
         time_created INTEGER NOT NULL, time_updated INTEGER NOT NULL, data TEXT NOT NULL);",
    )?;
    connection.execute("INSERT INTO session VALUES ('s', ?1)", params![version])?;
    Ok(Database {
        _folder: folder,
        path,
        connection,
    })
}

fn write(connection: &Connection, id: &str, updated: i64, data: &str) -> rusqlite::Result<()> {
    connection.execute(
        "INSERT INTO message (id, session_id, time_created, time_updated, data)
         VALUES (?1, 's', ?2, ?2, ?3)
         ON CONFLICT(id) DO UPDATE SET time_updated = ?2, data = ?3",
        params![id, updated, data],
    )?;
    Ok(())
}

#[test]
fn counts_replies_but_not_prompts_or_cache_reads() -> Result<(), Box<dyn std::error::Error>> {
    let database = database("1.18.27")?;
    let source = OpenCode::new(database.path.clone());
    let mut cursor = StoreCursor::default();

    write(&database.connection, "msg_1", 10, REPLY)?;
    write(&database.connection, "msg_2", 11, PROMPT)?;

    assert_eq!(source.read_new(&mut cursor, 0)?, 100 + 20 + 5 + 30);
    assert_eq!(source.read_new(&mut cursor, 0)?, 0);
    Ok(())
}

#[test]
fn credits_only_the_growth_of_a_reply_that_streams() -> Result<(), Box<dyn std::error::Error>> {
    let database = database("1.18.27")?;
    let source = OpenCode::new(database.path.clone());
    let mut cursor = StoreCursor::default();
    let early = r#"{"role":"assistant","tokens":{"input":100,"output":2}}"#;

    write(&database.connection, "msg_1", 10, early)?;
    assert_eq!(source.read_new(&mut cursor, 0)?, 102);
    write(&database.connection, "msg_1", 12, REPLY)?;

    assert_eq!(source.read_new(&mut cursor, 0)?, 155 - 102);
    Ok(())
}

#[test]
fn does_not_count_reasoning_twice_in_old_sessions() -> Result<(), Box<dyn std::error::Error>> {
    let database = database("1.3.15")?;
    let source = OpenCode::new(database.path.clone());

    write(&database.connection, "msg_1", 10, REPLY)?;

    assert_eq!(
        source.read_new(&mut StoreCursor::default(), 0)?,
        100 + 20 + 30
    );
    Ok(())
}

#[test]
fn reads_nothing_where_opencode_never_ran() -> Result<(), String> {
    let folder = tempfile::tempdir().map_err(|problem| problem.to_string())?;
    let source = OpenCode::new(folder.path().join("missing").join("opencode.db"));

    assert_eq!(source.read_new(&mut StoreCursor::default(), 0)?, 0);
    Ok(())
}

#[test]
fn owns_its_database_files_but_not_the_snapshots_beside_them() {
    let source = OpenCode::new(PathBuf::from("/data/opencode/opencode.db"));

    assert!(source.owns(&PathBuf::from("/private/data/opencode/opencode.db-wal")));
    assert!(!source.owns(&PathBuf::from("/data/opencode/snapshot/abc/index")));
}
