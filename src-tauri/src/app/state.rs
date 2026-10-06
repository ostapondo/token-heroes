use std::sync::{Mutex, PoisonError};

use crate::economy::ledger::{InsufficientCoins, Ledger, Wallet};
use crate::persistence::paths::Paths;
use crate::persistence::storage;
use crate::support::logging;

pub struct AppState {
    pub paths: Paths,
    ledger: Mutex<Ledger>,
    disk: Mutex<()>,
}

impl AppState {
    pub fn load(paths: Paths) -> Self {
        let ledger = storage::read_json(&paths.ledger()).unwrap_or_default();

        Self {
            paths,
            ledger: Mutex::new(ledger),
            disk: Mutex::new(()),
        }
    }

    pub fn wallet(&self) -> Wallet {
        self.current().wallet()
    }

    pub fn burn(&self, tokens: u64) -> Wallet {
        self.change(|ledger| {
            ledger.burn(tokens);
            ledger.wallet()
        })
    }

    pub fn spend(&self, amount: u64) -> Result<Wallet, InsufficientCoins> {
        self.change(|ledger| ledger.spend(amount).map(|()| ledger.wallet()))
    }

    fn current(&self) -> Ledger {
        *self.ledger.lock().unwrap_or_else(PoisonError::into_inner)
    }

    fn change<T>(&self, apply: impl FnOnce(&mut Ledger) -> T) -> T {
        let (result, changed) = {
            let mut ledger = self.ledger.lock().unwrap_or_else(PoisonError::into_inner);
            let before = *ledger;
            let result = apply(&mut ledger);

            (result, *ledger != before)
        };

        if changed {
            self.persist();
        }

        result
    }

    fn persist(&self) {
        let _writing = self.disk.lock().unwrap_or_else(PoisonError::into_inner);

        if let Err(problem) = storage::write_json(&self.paths.ledger(), &self.current()) {
            logging::error(&format!("could not save the ledger: {problem}"));
        }
    }
}
