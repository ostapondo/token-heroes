use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::burn::{Agent, Burn, Kinds};
use super::memory::LineMemory;
use super::source::TokenSource;

const TOKENS_MARKER: &str = "\"tokens\"";
const REPLY: &str = "gemini";

// Gemini CLI appends a message again when its tokens or tool calls arrive, so a reply is
// counted once by its id. Its input count already holds the cached input.
pub struct GeminiCli {
    root: PathBuf,
}

impl GeminiCli {
    pub const fn new(root: PathBuf) -> Self {
        Self { root }
    }
}

#[derive(Deserialize)]
struct Record {
    id: Option<String>,
    #[serde(rename = "type")]
    kind: Option<String>,
    model: Option<String>,
    tokens: Option<Tokens>,
}

#[derive(Deserialize)]
struct Tokens {
    #[serde(default)]
    input: u64,
    #[serde(default)]
    output: u64,
    #[serde(default)]
    thoughts: u64,
    #[serde(default)]
    tool: u64,
    #[serde(default)]
    cached: u64,
    #[serde(default)]
    total: u64,
}

impl Tokens {
    const fn burned(&self) -> u64 {
        if self.total > 0 {
            return self.total;
        }

        self.input
            .saturating_add(self.output)
            .saturating_add(self.thoughts)
            .saturating_add(self.tool)
    }

    const fn kinds(&self) -> Kinds {
        Kinds {
            input: self.input.saturating_sub(self.cached),
            output: self
                .output
                .saturating_add(self.thoughts)
                .saturating_add(self.tool),
            cache_writes: 0,
            cache_reads: self.cached,
        }
    }
}

impl TokenSource for GeminiCli {
    fn agent(&self) -> Agent {
        Agent::GeminiCli
    }

    fn root(&self) -> &Path {
        &self.root
    }

    fn burn_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<Burn, serde_json::Error> {
        if !line.contains(TOKENS_MARKER) {
            return Ok(Burn::default());
        }
        let record: Record = serde_json::from_str(line)?;
        let Some(tokens) = record
            .tokens
            .filter(|_| record.kind.as_deref() == Some(REPLY))
        else {
            return Ok(Burn::default());
        };
        let burned = tokens.burned();
        let credited = record
            .id
            .map_or(burned, |id| memory.message_growth(&id, burned));

        Ok(Burn::credited(tokens.kinds(), credited).by(record.model))
    }
}

#[cfg(test)]
mod tests {
    use super::GeminiCli;
    use crate::tokens::source::TokenSource;
    use crate::tokens::testing::Memory;
    use std::path::PathBuf;

    const REPLY: &str = r#"{"id":"5f1c","type":"gemini","content":"Done.","tokens":{"input":18342,"output":96,"cached":16210,"thoughts":211,"tool":0,"total":18649},"model":"gemini-2.5-pro"}"#;

    #[test]
    fn counts_the_total_with_cached_input() -> Result<(), serde_json::Error> {
        let source = GeminiCli::new(PathBuf::new());

        assert_eq!(
            source
                .burn_in(REPLY, &mut Memory::default().at(0))?
                .tokens(),
            18_649
        );
        Ok(())
    }

    #[test]
    fn counts_a_reply_appended_again_once() -> Result<(), serde_json::Error> {
        let source = GeminiCli::new(PathBuf::new());
        let mut memory = Memory::default();

        assert!(source.burn_in(REPLY, &mut memory.at(0))?.tokens() > 0);
        assert_eq!(source.burn_in(REPLY, &mut memory.at(1))?.tokens(), 0);
        Ok(())
    }

    #[test]
    fn ignores_prompts_metadata_and_checkpoints() -> Result<(), serde_json::Error> {
        let source = GeminiCli::new(PathBuf::new());
        let mut memory = Memory::default();
        let lines = [
            r#"{"id":"u1","type":"user","content":"hi"}"#,
            r#"{"sessionId":"s","startTime":"2026-10-06T10:00:00Z"}"#,
            r#"{"$set":{"messages":[{"id":"x","type":"gemini","tokens":{"total":9}}]}}"#,
        ];

        for line in lines {
            assert_eq!(source.burn_in(line, &mut memory.at(0))?.tokens(), 0);
        }
        Ok(())
    }
}
