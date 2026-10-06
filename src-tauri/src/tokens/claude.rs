use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::memory::LineMemory;
use super::source::TokenSource;

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
    #[serde(default, rename = "cache_read_input_tokens")]
    cache_reads: u64,
}

impl TokenSource for ClaudeCode {
    fn root(&self) -> &Path {
        &self.root
    }

    fn tokens_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<u64, serde_json::Error> {
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
        let tokens = usage
            .input
            .saturating_add(usage.output)
            .saturating_add(usage.cache_writes)
            .saturating_add(usage.cache_reads);

        Ok(id.map_or(tokens, |id| memory.message_growth(&id, tokens)))
    }
}

#[cfg(test)]
mod tests {
    use super::ClaudeCode;
    use crate::tokens::source::TokenSource;
    use crate::tokens::testing::Memory;
    use std::path::PathBuf;

    const ANSWER: &str = r#"{"type":"assistant","message":{"id":"msg_1","usage":{"input_tokens":2,"cache_creation_input_tokens":20329,"cache_read_input_tokens":26639,"output_tokens":865}}}"#;

    #[test]
    fn counts_input_output_and_cache_traffic() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());

        assert_eq!(
            source.tokens_in(ANSWER, &mut Memory::default().at(0))?,
            2 + 20_329 + 26_639 + 865
        );
        Ok(())
    }

    #[test]
    fn counts_a_streamed_message_once() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = Memory::default();

        assert!(source.tokens_in(ANSWER, &mut memory.at(0))? > 0);
        assert_eq!(source.tokens_in(ANSWER, &mut memory.at(1))?, 0);
        Ok(())
    }

    #[test]
    fn counts_the_final_usage_of_a_streamed_message() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = Memory::default();
        let longer = ANSWER.replace(r#""output_tokens":865"#, r#""output_tokens":1000"#);

        assert_eq!(source.tokens_in(ANSWER, &mut memory.at(0))?, 47_835);
        assert_eq!(source.tokens_in(&longer, &mut memory.at(0))?, 135);
        Ok(())
    }

    #[test]
    fn ignores_lines_without_usage_and_rejects_broken_json() {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = Memory::default();

        assert_eq!(
            source
                .tokens_in(r#"{"type":"user"}"#, &mut memory.at(0))
                .ok(),
            Some(0)
        );
        assert!(
            source
                .tokens_in(r#"{"usage": "#, &mut memory.at(0))
                .is_err()
        );
    }
}
