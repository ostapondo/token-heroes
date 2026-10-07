use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::burn::{Agent, Burn, Kinds};
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
    cwd: Option<String>,
    message: Option<Message>,
}

#[derive(Deserialize)]
struct Message {
    id: Option<String>,
    model: Option<String>,
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
    fn agent(&self) -> Agent {
        Agent::ClaudeCode
    }

    fn root(&self) -> &Path {
        &self.root
    }

    fn burn_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<Burn, serde_json::Error> {
        if !line.contains(USAGE_MARKER) {
            return Ok(Burn::default());
        }
        let entry: Entry = serde_json::from_str(line)?;
        let Some(Message {
            id,
            model,
            usage: Some(usage),
        }) = entry.message
        else {
            return Ok(Burn::default());
        };
        let kinds = Kinds {
            input: usage.input,
            output: usage.output,
            cache_writes: usage.cache_writes,
            cache_reads: usage.cache_reads,
        };
        let tokens = kinds.total();
        let credited = id.map_or(tokens, |id| memory.message_growth(&id, tokens));

        Ok(Burn::credited(kinds, credited)
            .by(model)
            .in_folder(entry.cwd.as_deref()))
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
            source
                .burn_in(ANSWER, &mut Memory::default().at(0))?
                .tokens(),
            2 + 20_329 + 26_639 + 865
        );
        Ok(())
    }

    #[test]
    fn counts_a_streamed_message_once() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = Memory::default();

        assert!(source.burn_in(ANSWER, &mut memory.at(0))?.tokens() > 0);
        assert_eq!(source.burn_in(ANSWER, &mut memory.at(1))?.tokens(), 0);
        Ok(())
    }

    #[test]
    fn counts_the_final_usage_of_a_streamed_message() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = Memory::default();
        let longer = ANSWER.replace(r#""output_tokens":865"#, r#""output_tokens":1000"#);

        assert_eq!(source.burn_in(ANSWER, &mut memory.at(0))?.tokens(), 47_835);
        assert_eq!(source.burn_in(&longer, &mut memory.at(0))?.tokens(), 135);
        Ok(())
    }

    #[test]
    fn ignores_lines_without_usage_and_rejects_broken_json() {
        let source = ClaudeCode::new(PathBuf::new());
        let mut memory = Memory::default();

        assert_eq!(
            source
                .burn_in(r#"{"type":"user"}"#, &mut memory.at(0))
                .ok()
                .map(|burn| burn.tokens()),
            Some(0)
        );
        assert!(source.burn_in(r#"{"usage": "#, &mut memory.at(0)).is_err());
    }

    #[test]
    fn credits_the_model_and_folder_of_a_reply() -> Result<(), serde_json::Error> {
        let source = ClaudeCode::new(PathBuf::new());
        let line = ANSWER.replace(
            r#"{"type":"assistant","message":{"id":"msg_1","#,
            r#"{"type":"assistant","cwd":"/code/heroes","message":{"id":"msg_1","model":"claude-opus-5-5","#,
        );
        let burn = source.burn_in(&line, &mut Memory::default().at(0))?;

        assert_eq!(burn.model.as_deref(), Some("claude-opus-5-5"));
        assert_eq!(burn.project.as_deref(), Some("heroes"));
        assert_eq!(burn.kinds.cache_reads, 26_639);
        Ok(())
    }
}
