use std::collections::BTreeMap;
use std::path::Path;

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Agent {
    ClaudeCode,
    Codex,
    GeminiCli,
    QwenCode,
    OpenCode,
    KiloCode,
}

// Tokens by what they were spent on. An agent that logs only a total puts it on input.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Kinds {
    pub input: u64,
    pub output: u64,
    pub cache_writes: u64,
    pub cache_reads: u64,
}

impl Kinds {
    pub const fn total(self) -> u64 {
        self.input
            .saturating_add(self.output)
            .saturating_add(self.cache_writes)
            .saturating_add(self.cache_reads)
    }

    pub const fn plus(self, other: Self) -> Self {
        Self {
            input: self.input.saturating_add(other.input),
            output: self.output.saturating_add(other.output),
            cache_writes: self.cache_writes.saturating_add(other.cache_writes),
            cache_reads: self.cache_reads.saturating_add(other.cache_reads),
        }
    }

    // What a line is credited can differ from its usage: a streamed reply counts again only by
    // what it grew, and a running total can jump past one request. Usage credited in full keeps
    // its split; the rest goes to output, which is what grows while a reply streams.
    pub const fn fitted(self, credited: u64) -> Self {
        let total = self.total();

        if credited == total {
            return self;
        }
        if credited > total {
            return Self {
                output: self.output.saturating_add(credited - total),
                ..self
            };
        }

        Self {
            input: 0,
            output: credited,
            cache_writes: 0,
            cache_reads: 0,
        }
    }
}

// What one line burned, split by kind, and the model and project folder it burned in.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Burn {
    pub kinds: Kinds,
    pub model: Option<String>,
    pub project: Option<String>,
}

impl Burn {
    pub const fn tokens(&self) -> u64 {
        self.kinds.total()
    }

    pub fn credited(usage: Kinds, credited: u64) -> Self {
        Self {
            kinds: usage.fitted(credited),
            ..Self::default()
        }
    }

    #[must_use]
    pub fn by(self, model: Option<String>) -> Self {
        Self { model, ..self }
    }

    #[must_use]
    pub fn in_project(self, project: Option<String>) -> Self {
        Self { project, ..self }
    }

    #[must_use]
    pub fn in_folder(self, cwd: Option<&str>) -> Self {
        Self {
            project: cwd.and_then(folder_name),
            ..self
        }
    }
}

// The project is the last part of the folder an agent ran in.
pub fn folder_name(cwd: &str) -> Option<String> {
    Path::new(cwd.trim_end_matches(['/', '\\']))
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Spender {
    pub agent: Agent,
    pub project: Option<String>,
    pub model: Option<String>,
}

// A batch's burns added up by agent, project and model, so a busy batch stays small.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Spending(BTreeMap<Spender, Kinds>);

impl Spending {
    pub const fn empty() -> Self {
        Self(BTreeMap::new())
    }

    pub fn add(&mut self, agent: Agent, burn: Burn) {
        if burn.tokens() == 0 {
            return;
        }
        let spender = Spender {
            agent,
            project: burn.project,
            model: burn.model,
        };
        let kinds = self.0.entry(spender).or_default();

        *kinds = kinds.plus(burn.kinds);
    }

    #[must_use]
    pub fn merged(mut self, other: Self) -> Self {
        for (spender, kinds) in other.0 {
            let entry = self.0.entry(spender).or_default();

            *entry = entry.plus(kinds);
        }

        self
    }

    pub fn tokens(&self) -> u64 {
        self.0
            .values()
            .fold(0, |sum, kinds| sum.saturating_add(kinds.total()))
    }

    pub fn iter(&self) -> impl Iterator<Item = (&Spender, &Kinds)> {
        self.0.iter()
    }
}

#[cfg(test)]
mod tests {
    use super::{Agent, Burn, Kinds, Spending, folder_name};

    const USAGE: Kinds = Kinds {
        input: 2,
        output: 8,
        cache_writes: 20,
        cache_reads: 70,
    };

    #[test]
    fn keeps_the_split_of_usage_credited_in_full() {
        assert_eq!(USAGE.fitted(100), USAGE);
    }

    #[test]
    fn puts_the_growth_of_a_streamed_reply_on_output() {
        assert_eq!(
            USAGE.fitted(6),
            Kinds {
                output: 6,
                ..Kinds::default()
            }
        );
        assert_eq!(USAGE.fitted(110).output, 18);
    }

    #[test]
    fn names_a_project_by_its_folder() {
        assert_eq!(
            folder_name("/Users/me/code/token-heroes/").as_deref(),
            Some("token-heroes")
        );
        assert_eq!(folder_name(""), None);
    }

    #[test]
    fn adds_up_burns_of_the_same_agent_project_and_model() {
        let burn = || {
            Burn::credited(USAGE, 100)
                .by(Some("opus".into()))
                .in_folder(Some("/code/heroes"))
        };
        let mut spending = Spending::default();

        spending.add(Agent::ClaudeCode, burn());
        spending.add(Agent::ClaudeCode, burn());
        spending.add(Agent::Codex, Burn::default());

        assert_eq!(spending.tokens(), 200);
        assert_eq!(spending.iter().count(), 1);
    }
}
