use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::source::{FileMemory, TokenSource};

const USAGE_MARKER: &str = "\"usage\"";

pub struct ClaudeCode {
    root: PathBuf,
}

impl ClaudeCode {
    pub const fn new(root: PathBuf) -> Self {
        Self { root }
    }
}

#[derive(Deserialize)]
struct Entry {
    message: Option<Message>,
}

#[derive(Deserialize)]
struct Message {
    id: Option<String>,
    usage: Option<Usage>,
}

#[derive(Deserialize)]
struct Usage {
    #[serde(default, rename = "input_tokens")]
    input: u64,
    #[serde(default, rename = "output_tokens")]
    output: u64,
    #[serde(default, rename = "cache_creation_input_tokens")]
    cache_writes: u64,
}

impl TokenSource for ClaudeCode {
    fn root(&self) -> &Path {
        &self.root
    }

    fn tokens_in(&self, line: &str, memory: &mut FileMemory) -> Result<u64, serde_json::Error> {
        if !line.contains(USAGE_MARKER) {
            return Ok(0);
        }
        let entry: Entry = serde_json::from_str(line)?;
        let Some(Message {
            id,
            usage: Some(usage),
        }) = entry.message
        else {
            return Ok(0);
        };
        if id.is_some_and(|id| !memory.first_sighting(&id)) {
            return Ok(0);
        }

        Ok(usage
            .input
            .saturating_add(usage.output)
            .saturating_add(usage.cache_writes))
    }
}

#[cfg(test)]
mod tests {
    use super::ClaudeCode;
    use crate::tokens::source::{FileMemory, TokenSource};
    use std::path::PathBuf;

    const ANSWER: &str = r#"{"type":"assistant","message":{"id":"msg_1","usage":{"input_tokens":2,"cache_creation_input_tokens":20329,"cache_read_input_tokens":26639,"output_tokens":865}}}"#;

    #[test]
    fn counts_input_output_and_cache_writes_but_not_cache_reads() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());

        assert_eq!(
            source.tokens_in(ANSWER, &mut FileMemory::default())?,
            2 + 20_329 + 865
        );
        Ok(())
    }

    #[test]
    fn counts_a_streamed_message_once() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = FileMemory::default();

        assert!(source.tokens_in(ANSWER, &mut memory)? > 0);
        assert_eq!(source.tokens_in(ANSWER, &mut memory)?, 0);
        Ok(())
    }

    #[test]
    fn ignores_lines_without_usage_and_rejects_broken_json() {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = FileMemory::default();

        assert_eq!(
            source.tokens_in(r#"{"type":"user"}"#, &mut memory).ok(),
            Some(0)
        );
        assert!(source.tokens_in(r#"{"usage": "#, &mut memory).is_err());
    }
}
