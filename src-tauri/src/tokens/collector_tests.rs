use super::{Batch, Collector};
use crate::tokens::claude::ClaudeCode;
use crate::tokens::memory::{FileCursor, Reading};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;

const ANSWER: &str = r#"{"message":{"id":"ID","usage":{"input_tokens":10,"output_tokens":5}}}"#;

fn answer(id: &str) -> String {
    format!("{}\n", ANSWER.replace("ID", id))
}

fn claude_at(root: &Path) -> Collector {
    Collector::new(vec![Box::new(ClaudeCode::new(root.to_path_buf()))])
}

const fn credited(tokens: u64) -> Batch {
    Batch {
        tokens,
        advanced: true,
    }
}

#[test]
fn reads_only_new_complete_lines() -> std::io::Result<()> {
    let root = tempfile::tempdir()?;
    let project = root.path().join("project");
    let transcript = project.join("session.jsonl");
    let collector = claude_at(root.path());
    let mut reading = Reading::default();

    fs::create_dir_all(&project)?;
    fs::write(&transcript, answer("a"))?;
    assert_eq!(collector.scan(&mut reading, 0), credited(15));

    let mut file = OpenOptions::new().append(true).open(&transcript)?;
    file.write_all(answer("b").as_bytes())?;
    file.write_all(br#"{"message":{"id":"c","usage":"#)?;
    assert_eq!(collector.read(&transcript, &mut reading, 0), credited(15));

    writeln!(file, r#"{{"input_tokens":1,"output_tokens":1}}}}}}"#)?;
    assert_eq!(collector.read(&transcript, &mut reading, 0), credited(2));
    assert_eq!(collector.scan(&mut reading, 0), Batch::default());
    Ok(())
}

#[test]
fn counts_a_message_once_across_a_session_and_its_compaction() -> std::io::Result<()> {
    let root = tempfile::tempdir()?;
    let subagents = root.path().join("project/session/subagents");
    let collector = claude_at(root.path());
    let mut reading = Reading::default();

    fs::create_dir_all(&subagents)?;
    fs::write(root.path().join("project/session.jsonl"), answer("a"))?;
    fs::write(
        subagents.join("agent-acompact-1.jsonl"),
        answer("a") + &answer("summary"),
    )?;

    assert_eq!(collector.scan(&mut reading, 0).tokens, 30);
    Ok(())
}

#[test]
fn rereads_a_transcript_that_was_cut_short() -> std::io::Result<()> {
    let root = tempfile::tempdir()?;
    let transcript = root.path().join("session.jsonl");
    let collector = claude_at(root.path());
    let mut reading = Reading::default();

    fs::write(&transcript, answer("a") + &answer("b"))?;
    collector.scan(&mut reading, 0);
    fs::write(&transcript, answer("c"))?;

    assert_eq!(collector.read(&transcript, &mut reading, 0), credited(15));
    Ok(())
}

#[test]
fn forgets_deleted_transcripts_but_not_those_of_a_missing_root() -> std::io::Result<()> {
    let root = tempfile::tempdir()?;
    let gone = root.path().join("gone.jsonl");
    let elsewhere = tempfile::tempdir()?;
    let unmounted = elsewhere.path().join("unmounted");
    let collector = Collector::new(vec![
        Box::new(ClaudeCode::new(root.path().to_path_buf())),
        Box::new(ClaudeCode::new(unmounted.clone())),
    ]);
    let mut reading = Reading::default();

    fs::write(&gone, answer("a"))?;
    collector.scan(&mut reading, 0);
    reading.files.insert(
        unmounted.join("old.jsonl"),
        FileCursor {
            offset: 1,
            running_total: None,
        },
    );
    fs::remove_file(&gone)?;

    assert_eq!(collector.scan(&mut reading, 0), credited(0));
    assert!(!reading.files.contains_key(&gone));
    assert!(reading.files.contains_key(&unmounted.join("old.jsonl")));
    Ok(())
}

#[test]
fn ignores_files_outside_its_sources() -> std::io::Result<()> {
    let root = tempfile::tempdir()?;
    let elsewhere = tempfile::tempdir()?;
    let stray = elsewhere.path().join("other.jsonl");

    fs::write(&stray, answer("x"))?;

    assert_eq!(
        claude_at(root.path()).read(&stray, &mut Reading::default(), 0),
        Batch::default()
    );
    Ok(())
}

#[cfg(unix)]
#[test]
fn keeps_one_cursor_when_events_arrive_through_a_symlinked_root() -> std::io::Result<()> {
    let folder = tempfile::tempdir()?;
    let real = folder.path().join("real");
    let linked = folder.path().join("linked");
    let collector = claude_at(&linked);
    let mut reading = Reading::default();

    fs::create_dir_all(&real)?;
    std::os::unix::fs::symlink(&real, &linked)?;
    fs::write(real.join("session.jsonl"), answer("a"))?;
    collector.scan(&mut reading, 0);

    let mut file = OpenOptions::new()
        .append(true)
        .open(real.join("session.jsonl"))?;
    file.write_all(answer("b").as_bytes())?;
    let reported = fs::canonicalize(&real)?.join("session.jsonl");

    assert_eq!(collector.read(&reported, &mut reading, 0), credited(15));
    assert_eq!(reading.files.len(), 1);
    Ok(())
}
