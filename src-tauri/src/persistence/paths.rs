use std::env;
use std::path::{Path, PathBuf};

const DATA_DIR: &str = ".token-heroes";
const CLAUDE_HOME_VAR: &str = "CLAUDE_CONFIG_DIR";
const CODEX_HOME_VAR: &str = "CODEX_HOME";

pub struct Paths {
    pub data: PathBuf,
    pub logs: PathBuf,
    pub claude_projects: PathBuf,
    pub codex_sessions: PathBuf,
}

impl Paths {
    pub fn resolve(home: &Path) -> Self {
        let data = home.join(DATA_DIR);
        let claude =
            env::var_os(CLAUDE_HOME_VAR).map_or_else(|| home.join(".claude"), PathBuf::from);
        let codex = env::var_os(CODEX_HOME_VAR).map_or_else(|| home.join(".codex"), PathBuf::from);

        Self {
            logs: data.join("logs"),
            data,
            claude_projects: claude.join("projects"),
            codex_sessions: codex.join("sessions"),
        }
    }

    pub fn ledger(&self) -> PathBuf {
        self.data.join("ledger.json")
    }

    pub fn save(&self) -> PathBuf {
        self.data.join("save.json")
    }

    pub fn cursors(&self) -> PathBuf {
        self.data.join("sources.json")
    }
}
