use std::fs;
use std::io;
use std::path::Path;

const LAYERS: [(&str, &[&str]); 8] = [
    ("support", &[]),
    ("economy", &[]),
    ("preferences", &[]),
    ("persistence", &["support"]),
    ("tokens", &["support"]),
    (
        "state",
        &["economy", "persistence", "preferences", "support", "tokens"],
    ),
    ("shell", &["preferences", "state", "support"]),
    (
        "app",
        &[
            "economy",
            "persistence",
            "shell",
            "state",
            "support",
            "tokens",
        ],
    ),
];

fn crossings(layer: &str, allowed: &[&str], source: &str) -> Vec<String> {
    source
        .split("crate::")
        .skip(1)
        .map(|rest| {
            rest.chars()
                .take_while(|character| character.is_alphanumeric() || *character == '_')
                .collect::<String>()
        })
        .filter(|target| target != layer && !allowed.contains(&target.as_str()))
        .map(|target| format!("{layer} reaches into {target}"))
        .collect()
}

fn sources_in(folder: &Path) -> io::Result<Vec<String>> {
    fs::read_dir(folder)?
        .map(|entry| fs::read_to_string(entry?.path()))
        .collect()
}

#[test]
fn every_module_imports_only_the_layers_below_it() -> io::Result<()> {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    let mut problems = Vec::new();

    for (layer, allowed) in LAYERS {
        for source in sources_in(&root.join(layer))? {
            problems.extend(crossings(layer, allowed, &source));
        }
    }

    assert_eq!(problems, Vec::<String>::new());
    Ok(())
}

#[test]
fn every_module_has_a_layer() -> io::Result<()> {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    let mut unplaced = Vec::new();

    for entry in fs::read_dir(root)? {
        let path = entry?.path();
        let name = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("");

        if path.is_dir() && !LAYERS.iter().any(|(layer, _)| *layer == name) {
            unplaced.push(name.to_owned());
        }
    }

    assert_eq!(unplaced, Vec::<String>::new());
    Ok(())
}
