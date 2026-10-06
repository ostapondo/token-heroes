use std::collections::HashMap;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct FileCursor {
    pub offset: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub running_total: Option<u64>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Sighting {
    pub counted: u64,
    pub at: u64,
}

// Shared by every transcript: Claude Code repeats a session's messages in its compaction
// transcripts, so a message must count once across files, not once per file. A streamed
// message is written on several lines and only the last one carries its final usage.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct SeenMessages(HashMap<String, Sighting>);

impl SeenMessages {
    pub fn growth(&mut self, id: &str, tokens: u64, now: u64) -> u64 {
        if let Some(sighting) = self.0.get_mut(id) {
            let grown = tokens.saturating_sub(sighting.counted);

            sighting.counted = sighting.counted.max(tokens);
            return grown;
        }
        self.0.insert(
            id.to_owned(),
            Sighting {
                counted: tokens,
                at: now,
            },
        );

        tokens
    }

    pub fn already_counted(&mut self, id: &str, now: u64) {
        self.0.entry(id.to_owned()).or_insert(Sighting {
            counted: u64::MAX,
            at: now,
        });
    }

    pub fn forget_before(&mut self, cutoff: u64) {
        self.0.retain(|_, sighting| sighting.at >= cutoff);
    }
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Reading {
    #[serde(default)]
    pub files: HashMap<PathBuf, FileCursor>,
    #[serde(default)]
    pub seen: SeenMessages,
}

pub struct LineMemory<'reading> {
    pub cursor: &'reading mut FileCursor,
    pub seen: &'reading mut SeenMessages,
    pub now: u64,
}

impl LineMemory<'_> {
    pub fn message_growth(&mut self, id: &str, tokens: u64) -> u64 {
        self.seen.growth(id, tokens, self.now)
    }
}

#[cfg(test)]
mod tests {
    use super::SeenMessages;

    #[test]
    fn counts_only_the_growth_of_a_message_it_has_seen() {
        let mut seen = SeenMessages::default();

        assert_eq!(seen.growth("msg_1", 100, 0), 100);
        assert_eq!(seen.growth("msg_1", 100, 1), 0);
        assert_eq!(seen.growth("msg_1", 140, 2), 40);
        assert_eq!(seen.growth("msg_1", 120, 3), 0);
    }

    #[test]
    fn forgets_messages_first_seen_before_the_cutoff() {
        let mut seen = SeenMessages::default();

        seen.growth("msg_1", 100, 100);
        seen.already_counted("msg_2", 200);
        seen.forget_before(150);

        assert_eq!(seen.growth("msg_1", 100, 300), 100);
        assert_eq!(seen.growth("msg_2", 100, 300), 0);
    }
}
