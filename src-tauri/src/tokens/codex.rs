use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::memory::LineMemory;
use super::source::TokenSource;

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
    total_token_usage: Option<Usage>,
    last_token_usage: Option<Usage>,
}

#[derive(Deserialize)]
struct Usage {
    #[serde(default, rename = "input_tokens")]
    input: u64,
    #[serde(default, rename = "cached_input_tokens")]
    cached: u64,
    #[serde(default, rename = "output_tokens")]
    output: u64,
}

impl Usage {
    const fn burned(&self) -> u64 {
        self.input
            .saturating_sub(self.cached)
            .saturating_add(self.output)
    }
}

impl TokenSource for Codex {
    fn root(&self) -> &Path {
        &self.root
    }

    // Codex logs a running total. It can start from a parent thread's total, and it starts
    // again from zero when a task restarts in the same file; in both cases the request's own
    // usage is what was burned.
    fn tokens_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<u64, serde_json::Error> {
        if !line.contains(TOKEN_COUNT_MARKER) {
            return Ok(0);
        }
        let event: Event = serde_json::from_str(line)?;
        let Some(info) = event
            .payload
            .filter(|payload| payload.kind.as_deref() == Some(TOKEN_COUNT))
            .and_then(|payload| payload.info)
        else {
            return Ok(0);
        };
        let Some(total) = info.total_token_usage.as_ref().map(Usage::burned) else {
            return Ok(0);
        };
        let request = info.last_token_usage.as_ref().map(Usage::burned);
        let burned = match memory.cursor.running_total {
            Some(previous) if total >= previous => total - previous,
            _ => request.unwrap_or(total),
        };

        memory.cursor.running_total = Some(total);

        Ok(burned)
    }
}

#[cfg(test)]
mod tests {
    use super::Codex;
    use crate::tokens::source::TokenSource;
    use crate::tokens::testing::Memory;
    use std::path::PathBuf;

    fn usage(input: u64, cached: u64, output: u64) -> String {
        format!(
            r#"{{"input_tokens":{input},"cached_input_tokens":{cached},"output_tokens":{output}}}"#
        )
    }

    fn count(total: (u64, u64, u64), last: (u64, u64, u64)) -> String {
        format!(
            r#"{{"type":"event_msg","payload":{{"type":"token_count","info":{{"total_token_usage":{},"last_token_usage":{}}}}}}}"#,
            usage(total.0, total.1, total.2),
            usage(last.0, last.1, last.2),
        )
    }

    fn burned(lines: &[String]) -> Result<Vec<u64>, serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let mut memory = Memory::default();

        lines
            .iter()
            .map(|line| source.tokens_in(line, &mut memory.at(0)))
            .collect()
    }

    #[test]
    fn counts_the_growth_of_the_running_total_once() -> Result<(), serde_json::Error> {
        let lines = [
            count((1_000, 400, 100), (1_000, 400, 100)),
            count((3_000, 900, 300), (2_000, 500, 200)),
            count((3_000, 900, 300), (2_000, 500, 200)),
        ];

        assert_eq!(burned(&lines)?, [700, 1_700, 0]);
        Ok(())
    }

    #[test]
    fn counts_a_restarted_total_from_its_own_request() -> Result<(), serde_json::Error> {
        let lines = [
            count((90_000, 10_000, 1_000), (5_000, 1_000, 100)),
            count((2_000, 1_000, 50), (2_000, 1_000, 50)),
            count((4_000, 1_500, 80), (2_000, 500, 30)),
        ];

        assert_eq!(burned(&lines)?, [4_100, 1_050, 1_530]);
        Ok(())
    }

    #[test]
    fn does_not_count_a_total_inherited_from_a_parent_thread() -> Result<(), serde_json::Error> {
        let lines = [
            count((1_500_000, 1_400_000, 9_000), (0, 0, 0)),
            count((1_510_000, 1_405_000, 9_100), (10_000, 5_000, 100)),
        ];

        assert_eq!(burned(&lines)?, [0, 5_100]);
        Ok(())
    }

    #[test]
    fn falls_back_to_the_total_when_a_log_has_no_request_usage() -> Result<(), serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let line = format!(
            r#"{{"type":"event_msg","payload":{{"type":"token_count","info":{{"total_token_usage":{}}}}}}}"#,
            usage(1_000, 400, 100),
        );

        assert_eq!(source.tokens_in(&line, &mut Memory::default().at(0))?, 700);
        Ok(())
    }

    #[test]
    fn ignores_a_token_count_without_totals() -> Result<(), serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let line = r#"{"type":"event_msg","payload":{"type":"token_count","info":null}}"#;

        assert_eq!(source.tokens_in(line, &mut Memory::default().at(0))?, 0);
        Ok(())
    }
}
