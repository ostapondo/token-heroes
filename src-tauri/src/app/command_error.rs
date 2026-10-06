use serde::Serialize;

#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum CommandError {
    InsufficientCoins,
    SaveTooLarge,
    SaveUnreadable,
    SaveNotWritten,
    UpdateUnreachable,
    UpdateGone,
    UpdateNotInstalled,
    BrowserUnavailable,
}

#[cfg(test)]
mod tests {
    use super::CommandError;

    #[test]
    fn sends_errors_as_the_strings_the_window_expects() -> Result<(), serde_json::Error> {
        assert_eq!(
            serde_json::to_string(&CommandError::InsufficientCoins)?,
            r#""insufficient-coins""#
        );
        Ok(())
    }
}
