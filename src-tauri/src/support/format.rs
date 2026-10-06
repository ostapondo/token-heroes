const UNITS: [(u128, &str); 5] = [
    (1_000_000_000_000_000, "Q"),
    (1_000_000_000_000, "T"),
    (1_000_000_000, "B"),
    (1_000_000, "M"),
    (1_000, "K"),
];

pub fn compact(value: u64) -> String {
    let amount = u128::from(value);
    let Some(&(size, suffix)) = UNITS.iter().find(|(size, _)| amount >= *size) else {
        return value.to_string();
    };
    let tenths = (amount * 10 + size / 2) / size;

    if tenths >= 1_000 {
        format!("{}{suffix}", (amount + size / 2) / size)
    } else {
        format!("{}.{}{suffix}", tenths / 10, tenths % 10)
    }
}

#[cfg(test)]
mod tests {
    use super::compact;

    #[test]
    fn writes_counts_the_way_the_game_does() {
        assert_eq!(compact(999), "999");
        assert_eq!(compact(12_400), "12.4K");
        assert_eq!(compact(148_000), "148K");
        assert_eq!(compact(17_900_000), "17.9M");
        assert_eq!(compact(1_000_000_000_000), "1.0T");
        assert_eq!(compact(u64::MAX), "18447Q");
    }
}
