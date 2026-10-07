use std::path::Path;

use super::burn::{Agent, Burn};
use super::memory::LineMemory;

pub trait TokenSource: Send {
    fn agent(&self) -> Agent;

    fn root(&self) -> &Path;

    fn burn_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<Burn, serde_json::Error>;
}
