use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Settings {
    pub show_balance: bool,
    pub close_on_blur: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            show_balance: true,
            close_on_blur: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Settings;

    #[test]
    fn fills_settings_missing_from_an_older_file() -> Result<(), serde_json::Error> {
        let settings: Settings = serde_json::from_str(r#"{"showBalance":false}"#)?;

        assert_eq!(
            settings,
            Settings {
                show_balance: false,
                close_on_blur: true
            }
        );
        Ok(())
    }
}
