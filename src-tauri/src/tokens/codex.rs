use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::source::{FileMemory, TokenSource};

const TOKEN_COUNT: &str = "token_count";
const TOKEN_COUNT_MARKER: &str = "\"token_count\"";

pub struct Codex {
    root: PathBuf,
}

impl Codex {
    pub const fn new(root: PathBuf) -> Self {
        Self { root }
    }
}

#[derive(Deserialize)]
struct Event {
    payload: Option<Payload>,
}

#[derive(Deserialize)]
struct Payload {
    #[serde(rename = "type")]
    kind: Option<String>,
    info: Option<Info>,
}

#[derive(Deserialize)]
struct Info {
    total_token_usage: Option<Totals>,
}

#[derive(Deserialize)]
struct Totals {
    #[serde(default, rename = "input_tokens")]
    input: u64,
    #[serde(default, rename = "cached_input_tokens")]
    cached: u64,
    #[serde(default, rename = "output_tokens")]
    output: u64,
}

impl TokenSource for Codex {
    fn root(&self) -> &Path {
        &self.root
    }

    fn tokens_in(&self, line: &str, memory: &mut FileMemory) -> Result<u64, serde_json::Error> {
        if !line.contains(TOKEN_COUNT_MARKER) {
            return Ok(0);
        }
        let event: Event = serde_json::from_str(line)?;
        let totals = event
            .payload
            .filter(|payload| payload.kind.as_deref() == Some(TOKEN_COUNT))
            .and_then(|payload| payload.info)
            .and_then(|info| info.total_token_usage);
        let Some(totals) = totals else { return Ok(0) };
        let total = totals
            .input
            .saturating_sub(totals.cached)
            .saturating_add(totals.output);
        let burned = total.saturating_sub(memory.last_total);

        memory.last_total = memory.last_total.max(total);

        Ok(burned)
    }
}

#[cfg(test)]
mod tests {
    use super::Codex;
    use crate::tokens::source::{FileMemory, TokenSource};
    use std::path::PathBuf;

    fn count(total_input: u64, cached: u64, output: u64) -> String {
        format!(
            r#"{{"type":"event_msg","payload":{{"type":"token_count","info":{{"total_token_usage":{{"input_tokens":{total_input},"cached_input_tokens":{cached},"output_tokens":{output}}}}}}}}}"#
        )
    }

    #[test]
    fn counts_the_growth_of_the_running_total() -> Result<(), serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let mut memory = FileMemory::default();

        assert_eq!(source.tokens_in(&count(1_000, 400, 100), &mut memory)?, 700);
        assert_eq!(
            source.tokens_in(&count(3_000, 900, 300), &mut memory)?,
            1_700
        );
        assert_eq!(source.tokens_in(&count(3_000, 900, 300), &mut memory)?, 0);
        Ok(())
    }

    #[test]
    fn ignores_a_token_count_without_totals() -> Result<(), serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let line = r#"{"type":"event_msg","payload":{"type":"token_count","info":null}}"#;

        assert_eq!(source.tokens_in(line, &mut FileMemory::default())?, 0);
        Ok(())
    }
}
