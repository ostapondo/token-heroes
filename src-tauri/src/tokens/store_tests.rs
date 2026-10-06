use super::StoreSource;
use crate::tokens::collector::Collector;
use crate::tokens::memory::{Reading, StoreCursor};
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

struct CountingStore {
    reads: Arc<AtomicU64>,
}

impl StoreSource for CountingStore {
    fn name(&self) -> &'static str {
        "counting"
    }

    fn root(&self) -> &Path {
        Path::new("/store")
    }

    fn owns(&self, path: &Path) -> bool {
        path.starts_with("/store/db")
    }

    fn read_new(&self, _cursor: &mut StoreCursor, _now: u64) -> Result<u64, String> {
        Ok(self.reads.fetch_add(1, Ordering::Relaxed) + 1)
    }
}

#[test]
fn reads_a_store_once_however_many_of_its_files_changed() {
    let reads = Arc::new(AtomicU64::default());
    let collector = Collector::new(Vec::new()).with_stores(vec![Box::new(CountingStore {
        reads: Arc::clone(&reads),
    })]);
    let changed: HashSet<PathBuf> = [
        "/store/db",
        "/store/db-wal",
        "/store/db-shm",
        "/store/other",
    ]
    .into_iter()
    .map(PathBuf::from)
    .collect();

    collector.read_changed(&changed, &mut Reading::default(), 0);
    assert_eq!(reads.load(Ordering::Relaxed), 1);

    collector.read_changed(
        &HashSet::from([PathBuf::from("/store/other")]),
        &mut Reading::default(),
        0,
    );
    assert_eq!(reads.load(Ordering::Relaxed), 1);
}
