use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::tokens::burn::{Agent, Kinds, Spending};

const SECONDS_PER_HOUR: u64 = 60 * 60;
// Two weeks of hours in any time zone, so the window can group them into the player's days.
const HOURS_KEPT: u64 = 15 * 24;

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Tally {
    pub agents: BTreeMap<Agent, Kinds>,
    pub projects: BTreeMap<String, u64>,
    pub models: BTreeMap<String, u64>,
}

impl Tally {
    fn add(&mut self, spending: &Spending) {
        for (spender, kinds) in spending.iter() {
            let agent = self.agents.entry(spender.agent).or_default();

            *agent = agent.plus(*kinds);
            let named = [
                (&mut self.projects, &spender.project),
                (&mut self.models, &spender.model),
            ];

            for (tally, name) in named {
                if let Some(name) = name {
                    let tokens = tally.entry(name.clone()).or_default();

                    *tokens = tokens.saturating_add(kinds.total());
                }
            }
        }
    }
}

// What was burned since the host began counting by agent: each UTC hour of the last two weeks
// and everything together. Coins burned before that are only in the ledger's total.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct History {
    pub since: Option<u64>,
    pub hours: BTreeMap<u64, Tally>,
    pub total: Tally,
}

impl History {
    pub fn record(&mut self, spending: &Spending, now: u64) {
        if spending.tokens() == 0 {
            return;
        }
        let hour = now / SECONDS_PER_HOUR;

        self.since.get_or_insert(now);
        self.hours.entry(hour).or_default().add(spending);
        self.total.add(spending);
        self.hours = self.hours.split_off(&hour.saturating_sub(HOURS_KEPT));
    }
}

#[cfg(test)]
mod tests {
    use super::{History, SECONDS_PER_HOUR};
    use crate::tokens::burn::{Agent, Burn, Kinds, Spending};

    const DAY: u64 = 24 * SECONDS_PER_HOUR;

    fn spending(agent: Agent, tokens: u64) -> Spending {
        let mut spending = Spending::default();
        let usage = Kinds {
            cache_reads: tokens,
            ..Kinds::default()
        };

        spending.add(
            agent,
            Burn::credited(usage, tokens)
                .by(Some("opus".into()))
                .in_folder(Some("/code/heroes")),
        );

        spending
    }

    #[test]
    fn counts_each_hour_and_the_whole_time() {
        let mut history = History::default();

        history.record(&spending(Agent::ClaudeCode, 100), 10);
        history.record(&spending(Agent::Codex, 50), 20);
        history.record(&spending(Agent::ClaudeCode, 30), SECONDS_PER_HOUR + 5);

        assert_eq!(history.since, Some(10));
        assert_eq!(history.hours.len(), 2);
        assert_eq!(
            history
                .total
                .agents
                .get(&Agent::ClaudeCode)
                .map(|kinds| kinds.cache_reads),
            Some(130)
        );
        assert_eq!(history.total.projects.get("heroes"), Some(&180));
        assert_eq!(history.total.models.get("opus"), Some(&180));
    }

    #[test]
    fn keeps_two_weeks_of_hours_and_the_total_of_all() {
        let mut history = History::default();

        history.record(&spending(Agent::ClaudeCode, 100), 0);
        history.record(&spending(Agent::ClaudeCode, 1), 16 * DAY);

        assert_eq!(history.hours.len(), 1);
        assert_eq!(
            history
                .total
                .agents
                .get(&Agent::ClaudeCode)
                .map(|kinds| kinds.total()),
            Some(101)
        );
    }

    #[test]
    fn ignores_a_batch_that_burned_nothing() {
        let mut history = History::default();

        history.record(&Spending::default(), 10);

        assert_eq!(history, History::default());
    }
}
