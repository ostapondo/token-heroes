use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{self, BufRead, BufReader, Seek, SeekFrom};
use std::path::{Path, PathBuf};

use super::source::{FileMemory, TokenSource};
use crate::support::logging;

const TRANSCRIPT_EXTENSION: &str = "jsonl";

pub type Cursors = HashMap<PathBuf, FileMemory>;

pub struct Collector {
    sources: Vec<Box<dyn TokenSource>>,
    cursors: Cursors,
    dirty: bool,
}

impl Collector {
    pub fn new(sources: Vec<Box<dyn TokenSource>>, cursors: Cursors) -> Self {
        Self {
            sources,
            cursors,
            dirty: false,
        }
    }

    pub fn roots(&self) -> impl Iterator<Item = &Path> {
        self.sources.iter().map(|source| source.root())
    }

    pub const fn cursors(&self) -> &Cursors {
        &self.cursors
    }

    pub const fn take_dirty(&mut self) -> bool {
        std::mem::replace(&mut self.dirty, false)
    }

    pub fn scan(&mut self) -> u64 {
        let files: Vec<PathBuf> = self.roots().flat_map(transcripts_under).collect();

        self.cursors.retain(|path, _| path.exists());

        files
            .iter()
            .fold(0, |total, path| total.saturating_add(self.read(path)))
    }

    pub fn read(&mut self, path: &Path) -> u64 {
        let is_transcript = path
            .extension()
            .is_some_and(|extension| extension == TRANSCRIPT_EXTENSION);
        let Some(index) = self
            .sources
            .iter()
            .position(|source| path.starts_with(source.root()))
        else {
            return 0;
        };
        if !is_transcript {
            return 0;
        }

        match self.read_appended(index, path) {
            Ok(tokens) => tokens,
            Err(problem) => {
                logging::warn(&format!("could not read {}: {problem}", path.display()));
                0
            }
        }
    }

    fn read_appended(&mut self, index: usize, path: &Path) -> io::Result<u64> {
        let Some(source) = self.sources.get(index) else {
            return Ok(0);
        };
        let mut file = File::open(path)?;
        let length = file.metadata()?.len();
        let memory = self.cursors.entry(path.to_path_buf()).or_default();

        if length < memory.offset {
            *memory = FileMemory::default();
        }
        if length == memory.offset {
            return Ok(0);
        }
        file.seek(SeekFrom::Start(memory.offset))?;
        let mut reader = BufReader::new(file);
        let mut line = Vec::new();
        let mut tokens = 0_u64;
        let mut unreadable = 0_usize;

        loop {
            line.clear();
            let read = reader.read_until(b'\n', &mut line)?;

            if read == 0 || line.last() != Some(&b'\n') {
                break;
            }
            memory.offset = memory
                .offset
                .saturating_add(u64::try_from(read).map_err(io::Error::other)?);
            match source.tokens_in(&String::from_utf8_lossy(&line), memory) {
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
        self.dirty = true;

        Ok(tokens)
    }
}

fn transcripts_under(root: &Path) -> Vec<PathBuf> {
    let mut pending = vec![root.to_path_buf()];
    let mut found = Vec::new();

    while let Some(folder) = pending.pop() {
        let Ok(entries) = fs::read_dir(&folder) else {
            continue;
        };

        for entry in entries.flatten() {
            let path = entry.path();

            if path.is_dir() {
                pending.push(path);
            } else if path
                .extension()
                .is_some_and(|extension| extension == TRANSCRIPT_EXTENSION)
            {
                found.push(path);
            }
        }
    }

    found
}

#[cfg(test)]
mod tests {
    use super::{Collector, Cursors};
    use crate::tokens::claude::ClaudeCode;
    use std::fs::{self, OpenOptions};
    use std::io::Write;

    const ANSWER: &str = r#"{"message":{"id":"ID","usage":{"input_tokens":10,"output_tokens":5}}}"#;

    fn answer(id: &str) -> String {
        format!("{}\n", ANSWER.replace("ID", id))
    }

    #[test]
    fn reads_only_new_complete_lines() -> std::io::Result<()> {
        let root = tempfile::tempdir()?;
        let project = root.path().join("project");
        let transcript = project.join("session.jsonl");
        let mut collector = Collector::new(
            vec![Box::new(ClaudeCode::new(root.path().to_path_buf()))],
            Cursors::default(),
        );

        fs::create_dir_all(&project)?;
        fs::write(&transcript, answer("a"))?;
        assert_eq!(collector.scan(), 15);

        let mut file = OpenOptions::new().append(true).open(&transcript)?;
        file.write_all(answer("b").as_bytes())?;
        file.write_all(br#"{"message":{"id":"c","usage":"#)?;
        assert_eq!(collector.read(&transcript), 15);

        writeln!(file, r#"{{"input_tokens":1,"output_tokens":1}}}}}}"#)?;
        assert_eq!(collector.read(&transcript), 2);
        assert_eq!(collector.scan(), 0);
        Ok(())
    }

    #[test]
    fn ignores_files_outside_its_sources() -> std::io::Result<()> {
        let root = tempfile::tempdir()?;
        let elsewhere = tempfile::tempdir()?;
        let stray = elsewhere.path().join("other.jsonl");
        let mut collector = Collector::new(
            vec![Box::new(ClaudeCode::new(root.path().to_path_buf()))],
            Cursors::default(),
        );

        fs::write(&stray, answer("x"))?;
        assert_eq!(collector.read(&stray), 0);
        Ok(())
    }
}
