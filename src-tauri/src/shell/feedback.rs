use std::env::consts::{ARCH, OS};

use tauri::{AppHandle, Url};
use tauri_plugin_opener::OpenerExt;

use crate::support::logging;

const NEW_ISSUE: &str = concat!(env!("CARGO_PKG_REPOSITORY"), "/issues/new");
const BUG_TEMPLATE: &str = "bug_report.yml";

fn bug_report_url() -> Option<Url> {
    let build = format!("{} · {OS} {ARCH}", env!("CARGO_PKG_VERSION"));

    Url::parse_with_params(NEW_ISSUE, [("template", BUG_TEMPLATE), ("version", &build)]).ok()
}

pub fn open_bug_report(app: &AppHandle) -> bool {
    let Some(url) = bug_report_url() else {
        logging::error("could not build the bug report link");
        return false;
    };

    match app.opener().open_url(url.as_str(), None::<&str>) {
        Ok(()) => true,
        Err(problem) => {
            logging::warn(&format!("could not open the bug report form: {problem}"));
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::bug_report_url;

    #[test]
    fn links_to_the_bug_form_with_this_build_filled_in() {
        let url = bug_report_url().map(String::from).unwrap_or_default();

        assert!(url.starts_with("https://github.com/ostapondo/token-heroes/issues/new?"));
        assert!(url.contains("template=bug_report.yml"));
        assert!(url.contains(&format!("version={}", env!("CARGO_PKG_VERSION"))));
    }
}
