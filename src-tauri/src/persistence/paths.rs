use std::env;
use std::path::{Path, PathBuf};

const DATA_DIR: &str = ".token-heroes";
const CLAUDE_HOME_VAR: &str = "CLAUDE_CONFIG_DIR";
const CODEX_HOME_VAR: &str = "CODEX_HOME";
const XDG_DATA_HOME_VAR: &str = "XDG_DATA_HOME";

pub struct Paths {
    pub data: PathBuf,
    pub logs: PathBuf,
    pub claude_projects: PathBuf,
    pub codex_sessions: PathBuf,
    pub opencode_data: PathBuf,
}

impl Paths {
    pub fn resolve(home: &Path) -> Self {
        let data = home.join(DATA_DIR);
        let claude =
            env::var_os(CLAUDE_HOME_VAR).map_or_else(|| home.join(".claude"), PathBuf::from);
        let codex = env::var_os(CODEX_HOME_VAR).map_or_else(|| home.join(".codex"), PathBuf::from);
        let xdg_data = env::var_os(XDG_DATA_HOME_VAR)
            .map_or_else(|| home.join(".local").join("share"), PathBuf::from);

        Self {
            logs: data.join("logs"),
            data,
            claude_projects: claude.join("projects"),
            codex_sessions: codex.join("sessions"),
            opencode_data: xdg_data.join("opencode"),
        }
    }

    pub fn ledger(&self) -> PathBuf {
        self.data.join("ledger.json")
    }

    pub fn save(&self) -> PathBuf {
        self.data.join("save.json")
    }

    pub fn settings(&self) -> PathBuf {
        self.data.join("settings.json")
    }

    pub fn legacy_cursors(&self) -> PathBuf {
        self.data.join("sources.json")
    }
}
