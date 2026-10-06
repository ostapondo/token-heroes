use serde::{Deserialize, Serialize};

use crate::economy::ledger::Ledger;
use crate::tokens::memory::Reading;

// Coins and the transcript positions that produced them are one record on disk, so a crash
// rolls both back together and the same lines are credited exactly once when read again.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Book {
    #[serde(flatten)]
    pub ledger: Ledger,
    #[serde(default)]
    pub reading: Reading,
}

#[cfg(test)]
mod tests {
    use super::Book;
    use crate::economy::ledger::Ledger;

    #[test]
    fn reads_a_ledger_written_before_positions_joined_it() -> Result<(), serde_json::Error> {
        let book: Book = serde_json::from_str(r#"{"burned":1000,"spent":400}"#)?;

        assert_eq!(
            book.ledger,
            Ledger {
                burned: 1_000,
                spent: 400
            }
        );
        assert!(book.reading.files.is_empty());
        Ok(())
    }
}
