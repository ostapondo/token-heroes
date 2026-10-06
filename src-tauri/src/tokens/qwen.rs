use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::memory::LineMemory;
use super::source::TokenSource;

const USAGE_MARKER: &str = "\"usageMetadata\"";
const REPLY: &str = "assistant";

// Qwen Code logs usage in Gemini's shape on assistant records. Its total minus cached input is
// right for every provider adapter; candidates and thoughts overlap on some, so are not summed.
// A branched session copies records with their ids, so a copy is skipped.
pub struct QwenCode {
    root: PathBuf,
}

impl QwenCode {
    pub const fn new(root: PathBuf) -> Self {
        Self { root }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Record {
    uuid: Option<String>,
    #[serde(rename = "type")]
    kind: Option<String>,
    forked_from: Option<serde_json::Value>,
    usage_metadata: Option<Usage>,
}

#[derive(Deserialize)]
struct Usage {
    #[serde(default, rename = "promptTokenCount")]
    prompt: u64,
    #[serde(default, rename = "candidatesTokenCount")]
    candidates: u64,
    #[serde(default, rename = "cachedContentTokenCount")]
    cached: u64,
    #[serde(default, rename = "totalTokenCount")]
    total: u64,
}

impl Usage {
    const fn burned(&self) -> u64 {
        let total = if self.total > 0 {
            self.total
        } else {
            self.prompt.saturating_add(self.candidates)
        };

        total.saturating_sub(self.cached)
    }
}

impl TokenSource for QwenCode {
    fn root(&self) -> &Path {
        &self.root
    }

    fn tokens_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<u64, serde_json::Error> {
        if !line.contains(USAGE_MARKER) {
            return Ok(0);
        }
        let record: Record = serde_json::from_str(line)?;
        let reply = record.kind.as_deref() == Some(REPLY) && record.forked_from.is_none();
        let Some(usage) = record.usage_metadata.filter(|_| reply) else {
            return Ok(0);
        };
        let burned = usage.burned();

        Ok(record
            .uuid
            .map_or(burned, |id| memory.message_growth(&id, burned)))
    }
}

#[cfg(test)]
mod tests {
    use super::QwenCode;
    use crate::tokens::source::TokenSource;
    use crate::tokens::testing::Memory;
    use std::path::PathBuf;

    const REPLY: &str = r#"{"uuid":"a1","parentUuid":"9f","sessionId":"3c","type":"assistant","model":"qwen3-coder-plus","usageMetadata":{"promptTokenCount":15234,"candidatesTokenCount":412,"totalTokenCount":15646,"cachedContentTokenCount":12800,"thoughtsTokenCount":0}}"#;

    #[test]
    fn counts_the_total_without_cached_input() -> Result<(), serde_json::Error> {
        let source = QwenCode::new(PathBuf::new());

        assert_eq!(
            source.tokens_in(REPLY, &mut Memory::default().at(0))?,
            15_646 - 12_800
        );
        Ok(())
    }

    #[test]
    fn skips_a_branch_copy_and_telemetry() -> Result<(), serde_json::Error> {
        let source = QwenCode::new(PathBuf::new());
        let mut memory = Memory::default();
        let copy = REPLY.replace(
            r#""type":"assistant""#,
            r#""type":"assistant","forkedFrom":"s0""#,
        );
        let telemetry = r#"{"uuid":"t1","type":"system","subtype":"ui_telemetry","usageMetadata":{"totalTokenCount":9}}"#;

        assert_eq!(source.tokens_in(&copy, &mut memory.at(0))?, 0);
        assert_eq!(source.tokens_in(telemetry, &mut memory.at(0))?, 0);
        Ok(())
    }
}
