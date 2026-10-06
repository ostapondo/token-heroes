use std::fs;
use std::path::{Path, PathBuf};

use super::source::TokenSource;

const TRANSCRIPT_EXTENSION: &str = "jsonl";

pub fn is_transcript(path: &Path) -> bool {
    path.extension()
        .is_some_and(|extension| extension == TRANSCRIPT_EXTENSION)
}

pub fn transcripts_under(root: &Path) -> Vec<PathBuf> {
    let mut pending = vec![root.to_path_buf()];
    let mut found = Vec::new();

    while let Some(folder) = pending.pop() {
        let Ok(entries) = fs::read_dir(&folder) else {
            continue;
        };

        for entry in entries.flatten() {
            let path = entry.path();

            if path.is_dir() {
                pending.push(path);
            } else if is_transcript(&path) {
                found.push(path);
            }
        }
    }

    found
}

// A file watcher reports real paths, so a source whose root sits behind a symlink sees
// events under the resolved folder. Cursors keep the root as configured.
pub fn locate<'sources>(
    sources: &'sources [Box<dyn TokenSource>],
    path: &Path,
) -> Option<(&'sources dyn TokenSource, PathBuf)> {
    sources.iter().find_map(|source| {
        let root = source.root();

        if path.starts_with(root) {
            return Some((source.as_ref(), path.to_path_buf()));
        }
        let resolved = fs::canonicalize(root).ok()?;
        let inside = path.strip_prefix(resolved).ok()?;

        Some((source.as_ref(), root.join(inside)))
    })
}
