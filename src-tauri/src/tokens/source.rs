use std::path::Path;

use super::memory::LineMemory;

pub trait TokenSource: Send {
    fn root(&self) -> &Path;

    fn tokens_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<u64, serde_json::Error>;
}
