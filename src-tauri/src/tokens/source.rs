use std::collections::VecDeque;
use std::path::Path;

use serde::{Deserialize, Serialize};

const REMEMBERED_IDS: usize = 16;

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct FileMemory {
    pub offset: u64,
    #[serde(default)]
    pub recent_ids: VecDeque<String>,
    #[serde(default)]
    pub last_total: u64,
}

impl FileMemory {
    pub fn first_sighting(&mut self, id: &str) -> bool {
        if self.recent_ids.iter().any(|seen| seen == id) {
            return false;
        }
        self.recent_ids.push_back(id.to_owned());
        if self.recent_ids.len() > REMEMBERED_IDS {
            self.recent_ids.pop_front();
        }

        true
    }
}

pub trait TokenSource: Send {
    fn root(&self) -> &Path;

    fn tokens_in(&self, line: &str, memory: &mut FileMemory) -> Result<u64, serde_json::Error>;
}
