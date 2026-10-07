use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::burn::{Agent, Burn, Kinds, folder_name};
use super::memory::LineMemory;
use super::source::TokenSource;

const TOKEN_COUNT: &str = "token_count";
const TOKEN_COUNT_MARKER: &str = "\"token_count\"";
const CONTEXTS: [&str; 2] = ["session_meta", "turn_context"];
const CONTEXT_MARKERS: [&str; 2] = ["\"session_meta\"", "\"turn_context\""];

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
    #[serde(rename = "type")]
    kind: Option<String>,
    payload: Option<Payload>,
}

#[derive(Deserialize)]
struct Payload {
    #[serde(rename = "type")]
    kind: Option<String>,
    info: Option<Info>,
    cwd: Option<String>,
    model: Option<String>,
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
    #[serde(default, rename = "output_tokens")]
    output: u64,
    #[serde(default, rename = "cached_input_tokens")]
    cached: u64,
}

// The input holds the cached input and the output holds the reasoning. An imported session
// logs only an estimated total, which no request burned.
impl Usage {
    const fn burned(&self) -> u64 {
        self.input.saturating_add(self.output)
    }

    const fn kinds(&self) -> Kinds {
        Kinds {
            input: self.input.saturating_sub(self.cached),
            output: self.output,
            cache_writes: 0,
            cache_reads: self.cached,
        }
    }
}

impl TokenSource for Codex {
    fn agent(&self) -> Agent {
        Agent::Codex
    }

    fn root(&self) -> &Path {
        &self.root
    }

    // Codex logs a running total. It can start from a parent thread's total, and it starts
    // again from zero when a task restarts in the same file; in both cases the request's own
    // usage is what was burned.
    // The session names its folder and model in context lines, which the cursor keeps for the
    // token counts that follow.
    fn burn_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<Burn, serde_json::Error> {
        if CONTEXT_MARKERS.iter().any(|marker| line.contains(marker)) {
            let event: Event = serde_json::from_str(line)?;

            if let Some(payload) = event
                .payload
                .filter(|_| CONTEXTS.contains(&event.kind.as_deref().unwrap_or_default()))
            {
                if let Some(project) = payload.cwd.as_deref().and_then(folder_name) {
                    memory.cursor.project = Some(project);
                }
                if payload.model.is_some() {
                    memory.cursor.model = payload.model;
                }
                return Ok(Burn::default());
            }
        }
        if !line.contains(TOKEN_COUNT_MARKER) {
            return Ok(Burn::default());
        }
        let event: Event = serde_json::from_str(line)?;
        let Some(info) = event
            .payload
            .filter(|payload| payload.kind.as_deref() == Some(TOKEN_COUNT))
            .and_then(|payload| payload.info)
        else {
            return Ok(Burn::default());
        };
        let Some(total) = info.total_token_usage.as_ref().map(Usage::burned) else {
            return Ok(Burn::default());
        };
        let request = info.last_token_usage.as_ref();
        let burned = match memory.cursor.running_total {
            Some(previous) if total >= previous => total - previous,
            _ => request.map_or(total, Usage::burned),
        };
        let kinds = request
            .or(info.total_token_usage.as_ref())
            .map(Usage::kinds)
            .unwrap_or_default();

        memory.cursor.running_total = Some(total);

        Ok(Burn::credited(kinds, burned)
            .by(memory.cursor.model.clone())
            .in_project(memory.cursor.project.clone()))
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
            .map(|line| {
                source
                    .burn_in(line, &mut memory.at(0))
                    .map(|burn| burn.tokens())
            })
            .collect()
    }

    #[test]
    fn counts_the_growth_of_the_running_total_once() -> Result<(), serde_json::Error> {
        let lines = [
            count((1_000, 400, 100), (1_000, 400, 100)),
            count((3_000, 900, 300), (2_000, 500, 200)),
            count((3_000, 900, 300), (2_000, 500, 200)),
        ];

        assert_eq!(burned(&lines)?, [1_100, 2_200, 0]);
        Ok(())
    }

    #[test]
    fn counts_a_restarted_total_from_its_own_request() -> Result<(), serde_json::Error> {
        let lines = [
            count((90_000, 10_000, 1_000), (5_000, 1_000, 100)),
            count((2_000, 1_000, 50), (2_000, 1_000, 50)),
            count((4_000, 1_500, 80), (2_000, 500, 30)),
        ];

        assert_eq!(burned(&lines)?, [5_100, 2_050, 2_030]);
        Ok(())
    }

    #[test]
    fn does_not_count_a_total_inherited_from_a_parent_thread() -> Result<(), serde_json::Error> {
        let lines = [
            count((1_500_000, 1_400_000, 9_000), (0, 0, 0)),
            count((1_510_000, 1_405_000, 9_100), (10_000, 5_000, 100)),
        ];

        assert_eq!(burned(&lines)?, [0, 10_100]);
        Ok(())
    }

    #[test]
    fn falls_back_to_the_total_when_a_log_has_no_request_usage() -> Result<(), serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let line = format!(
            r#"{{"type":"event_msg","payload":{{"type":"token_count","info":{{"total_token_usage":{}}}}}}}"#,
            usage(1_000, 400, 100),
        );

        assert_eq!(
            source
                .burn_in(&line, &mut Memory::default().at(0))?
                .tokens(),
            1_100
        );
        Ok(())
    }

    #[test]
    fn does_not_count_the_estimate_of_an_imported_session() -> Result<(), serde_json::Error> {
        let estimate =
            r#"{"input_tokens":0,"cached_input_tokens":0,"output_tokens":0,"total_tokens":845}"#;
        let line = format!(
            r#"{{"type":"event_msg","payload":{{"type":"token_count","info":{{"total_token_usage":{estimate},"last_token_usage":{estimate}}}}}}}"#,
        );

        assert_eq!(burned(&[line])?, [0]);
        Ok(())
    }

    #[test]
    fn ignores_a_token_count_without_totals() -> Result<(), serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let line = r#"{"type":"event_msg","payload":{"type":"token_count","info":null}}"#;

        assert_eq!(
            source.burn_in(line, &mut Memory::default().at(0))?.tokens(),
            0
        );
        Ok(())
    }

    #[test]
    fn credits_the_session_folder_model_and_cached_input() -> Result<(), serde_json::Error> {
        let source = Codex::new(PathBuf::new());
        let mut memory = Memory::default();
        let context =
            r#"{"type":"turn_context","payload":{"cwd":"/code/heroes","model":"gpt-6-sol"}}"#;
        let request = r#"{"type":"event_msg","payload":{"type":"token_count","info":{"total_token_usage":{"input_tokens":1000,"cached_input_tokens":800,"output_tokens":50},"last_token_usage":{"input_tokens":1000,"cached_input_tokens":800,"output_tokens":50}}}}"#;

        assert_eq!(source.burn_in(context, &mut memory.at(0))?.tokens(), 0);
        let burn = source.burn_in(request, &mut memory.at(0))?;

        assert_eq!(burn.project.as_deref(), Some("heroes"));
        assert_eq!(burn.model.as_deref(), Some("gpt-6-sol"));
        assert_eq!(
            (burn.kinds.input, burn.kinds.cache_reads, burn.kinds.output),
            (200, 800, 50)
        );
        Ok(())
    }
}
