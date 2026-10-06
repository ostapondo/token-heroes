use std::sync::{Mutex, MutexGuard, PoisonError};

use super::book::Book;
use super::legacy;
use crate::economy::ledger::{InsufficientCoins, Wallet};
use crate::persistence::paths::Paths;
use crate::persistence::storage;
use crate::preferences::settings::Settings;
use crate::support::{clock, logging};
use crate::tokens::memory::Reading;

struct Journal {
    book: Book,
    unsaved: bool,
}

pub struct AppState {
    pub paths: Paths,
    journal: Mutex<Journal>,
    settings: Mutex<Settings>,
    disk: Mutex<()>,
}

fn locked<T>(mutex: &Mutex<T>) -> MutexGuard<'_, T> {
    mutex.lock().unwrap_or_else(PoisonError::into_inner)
}

impl AppState {
    pub fn load(paths: Paths) -> Self {
        let mut book: Book = storage::read_json(&paths.ledger()).unwrap_or_default();
        let adopted = legacy::adopt_cursors(&paths, &mut book, clock::unix_seconds());
        let settings = storage::read_json(&paths.settings()).unwrap_or_default();
        let state = Self {
            paths,
            journal: Mutex::new(Journal {
                book,
                unsaved: adopted,
            }),
            settings: Mutex::new(settings),
            disk: Mutex::new(()),
        };

        if adopted && state.save() {
            legacy::retire_cursors(&state.paths);
        }

        state
    }

    pub fn wallet(&self) -> Wallet {
        locked(&self.journal).book.ledger.wallet()
    }

    pub fn reading(&self) -> Reading {
        locked(&self.journal).book.reading.clone()
    }

    pub fn credit(&self, tokens: u64, reading: Reading) -> Option<Wallet> {
        let wallet = {
            let mut journal = locked(&self.journal);

            journal.book.ledger.burn(tokens);
            journal.book.reading = reading;
            journal.unsaved = true;
            journal.book.ledger.wallet()
        };

        (tokens > 0).then_some(wallet)
    }

    pub fn spend(&self, amount: u64) -> Result<Wallet, InsufficientCoins> {
        let wallet = {
            let mut journal = locked(&self.journal);

            journal.book.ledger.spend(amount)?;
            journal.unsaved = true;
            journal.book.ledger.wallet()
        };

        self.save();

        Ok(wallet)
    }

    pub fn save(&self) -> bool {
        let _writing = locked(&self.disk);
        let book = {
            let mut journal = locked(&self.journal);

            if !journal.unsaved {
                return true;
            }
            journal.unsaved = false;
            journal.book.clone()
        };

        if let Err(problem) = storage::write_json(&self.paths.ledger(), &book) {
            logging::error(&format!("could not save the ledger: {problem}"));
            locked(&self.journal).unsaved = true;
            return false;
        }

        true
    }

    pub fn settings(&self) -> Settings {
        *locked(&self.settings)
    }

    pub fn update_settings(&self, change: impl FnOnce(&mut Settings)) -> Settings {
        let updated = {
            let mut settings = locked(&self.settings);

            change(&mut settings);
            *settings
        };

        if let Err(problem) = storage::write_json(&self.paths.settings(), &updated) {
            logging::error(&format!("could not save the settings: {problem}"));
        }

        updated
    }
}

#[cfg(test)]
#[path = "app_state_tests.rs"]
mod tests;
