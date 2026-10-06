use super::memory::{FileCursor, LineMemory, SeenMessages};

#[derive(Default)]
pub struct Memory {
    pub cursor: FileCursor,
    pub seen: SeenMessages,
}

impl Memory {
    pub const fn at(&mut self, now: u64) -> LineMemory<'_> {
        LineMemory {
            cursor: &mut self.cursor,
            seen: &mut self.seen,
            now,
        }
    }
}
