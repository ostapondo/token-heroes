use serde::{Deserialize, Serialize};

pub const MAX_SAFE_INTEGER: u64 = 9_007_199_254_740_991;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Ledger {
    pub burned: u64,
    pub spent: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
pub struct Wallet {
    pub burned: u64,
    pub spent: u64,
    pub balance: u64,
}

#[derive(Debug, PartialEq, Eq)]
pub struct InsufficientCoins;

impl Ledger {
    pub const fn balance(self) -> u64 {
        self.burned.saturating_sub(self.spent)
    }

    pub const fn burn(&mut self, tokens: u64) {
        self.burned = self.burned.saturating_add(tokens);
    }

    pub const fn spend(&mut self, amount: u64) -> Result<(), InsufficientCoins> {
        if amount > self.balance() {
            return Err(InsufficientCoins);
        }
        self.spent += amount;

        Ok(())
    }

    pub fn wallet(self) -> Wallet {
        Wallet {
            burned: self.burned.min(MAX_SAFE_INTEGER),
            spent: self.spent.min(MAX_SAFE_INTEGER),
            balance: self.balance().min(MAX_SAFE_INTEGER),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{InsufficientCoins, Ledger, MAX_SAFE_INTEGER};

    #[test]
    fn spends_only_what_was_burned() {
        let mut ledger = Ledger::default();

        ledger.burn(1_000);

        assert_eq!(ledger.spend(400), Ok(()));
        assert_eq!(ledger.spend(601), Err(InsufficientCoins));
        assert_eq!(ledger.balance(), 600);
    }

    #[test]
    fn never_overflows_and_never_sends_an_unsafe_number() {
        let mut ledger = Ledger {
            burned: u64::MAX - 1,
            spent: 0,
        };

        ledger.burn(u64::MAX);

        assert_eq!(ledger.burned, u64::MAX);
        assert_eq!(ledger.wallet().balance, MAX_SAFE_INTEGER);
    }
}
