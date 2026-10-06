use std::env;
use std::path::{Path, PathBuf};

const DATA_DIR: &str = ".token-heroes";
const CLAUDE_HOME_VAR: &str = "CLAUDE_CONFIG_DIR";
const CODEX_HOME_VAR: &str = "CODEX_HOME";
const XDG_DATA_HOME_VAR: &str = "XDG_DATA_HOME";
const OPENCODE_DB_VAR: &str = "OPENCODE_DB";
const KILO_DB_VAR: &str = "KILO_DB";
const GEMINI_HOME_VAR: &str = "GEMINI_CLI_HOME";
const QWEN_HOME_VARS: [&str; 2] = ["QWEN_RUNTIME_DIR", "QWEN_HOME"];

pub struct Paths {
    pub data: PathBuf,
    pub logs: PathBuf,
    pub claude_projects: PathBuf,
    pub codex_sessions: PathBuf,
    pub opencode_database: PathBuf,
    pub kilo_database: PathBuf,
    pub gemini_sessions: PathBuf,
    pub qwen_projects: PathBuf,
}

impl Paths {
    pub fn resolve(home: &Path) -> Self {
        let data = home.join(DATA_DIR);
        let claude =
            env::var_os(CLAUDE_HOME_VAR).map_or_else(|| home.join(".claude"), PathBuf::from);
        let codex = env::var_os(CODEX_HOME_VAR).map_or_else(|| home.join(".codex"), PathBuf::from);
        let xdg_data = env::var_os(XDG_DATA_HOME_VAR)
            .map_or_else(|| home.join(".local").join("share"), PathBuf::from);
        let gemini = env::var_os(GEMINI_HOME_VAR).map_or_else(|| home.to_path_buf(), PathBuf::from);
        let qwen = QWEN_HOME_VARS
            .iter()
            .find_map(env::var_os)
            .map_or_else(|| home.join(".qwen"), PathBuf::from);

        Self {
            logs: data.join("logs"),
            data,
            claude_projects: claude.join("projects"),
            codex_sessions: codex.join("sessions"),
            opencode_database: env::var_os(OPENCODE_DB_VAR).map_or_else(
                || xdg_data.join("opencode").join("opencode.db"),
                PathBuf::from,
            ),
            kilo_database: env::var_os(KILO_DB_VAR)
                .map_or_else(|| xdg_data.join("kilo").join("kilo.db"), PathBuf::from),
            gemini_sessions: gemini.join(".gemini").join("tmp"),
            qwen_projects: qwen.join("projects"),
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
