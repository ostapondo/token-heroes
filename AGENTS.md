# Token Heroes repository instructions

Token Heroes is an endless idle RPG that lives in the system tray. Coins are the tokens
your coding agents burn. The fight never gives coins; a stuck party needs more burned
tokens to level up.

## Layers

TypeScript in `src/` is split into layers. Each layer is reached only through its alias,
never through a path behind it. `.oxlintrc.json` fails on a crossing.

| Layer          | Alias       | May import                     | Holds                                                            |
| -------------- | ----------- | ------------------------------ | ---------------------------------------------------------------- |
| `src/engine`   | `@engine`   | nothing                        | game rules: stages, battle, levels, offline progress             |
| `src/content`  | `@content`  | `@engine`                      | data: sprites, elements, creatures, bosses, enemies, heroes      |
| `src/render`   | `@render`   | `@engine`, `@content`, `@i18n` | canvas drawing, sprite cache, weather and combat effects         |
| `src/platform` | `@platform` | `@engine`                      | the Tauri host: wallet, saves, events                            |
| `src/i18n`     | `@i18n`     | nothing                        | the English catalogue, `t()` and `tCount()`                      |
| `src/balance`  | `@balance`  | `@engine`, `@content`          | balance sheets, battle runs and rules for `pnpm balance` and MCP |
| `src/ui`       | none        | every alias                    | React screens and the HUD                                        |

`src-tauri` is the Rust host. It watches agent transcripts, owns the coin ledger, stores
saves and draws the tray. Game rules never move into Rust.

## UI

`src/ui` follows `app → widgets → features → entities → shared`; a layer imports only layers
to its right, and a feature or entity is reached only through its `index.ts`.
`src/ui/.oxlintrc.json` fails on both.

- A feature holds `components/` (each `*.tsx` beside its `*.recipe.ts`), `hooks/`, `model/`
  (pure functions with tests), `types.ts` and `constants.ts`. Never add `utils.ts` or
  `helpers.ts`.
- `entities/game` owns game state: a zustand store changed only by `store/game-actions.ts`,
  read through `store/game-selectors.ts`, and a `GameSession` that runs the engine tick,
  wallet events and saves.
- Select with `useGame(selector)`; wrap a selector that returns an object in `useShallow`.
- Style with Panda: tokens, text styles and recipes in `shared/theme`, component styles in
  `*.recipe.ts`. Inline `style` only carries runtime values such as a width or an accent.
- Every visible string goes through `t()`; JSX text literals fail lint.

## Rust host

| Folder         | Holds                                                                 |
| -------------- | --------------------------------------------------------------------- |
| `app/`         | Tauri wiring: setup, IPC commands, events, the crediting loop         |
| `shell/`       | tray, tray menu, game window and their copy                           |
| `state/`       | `AppState`: the book (ledger plus transcript positions) and settings  |
| `tokens/`      | the `TokenSource` trait, Claude Code and Codex readers, the collector |
| `persistence/` | data paths and atomic JSON storage with backups and quarantine        |
| `economy/`     | the ledger and the wallet sent to the UI                              |
| `preferences/` | the tray settings                                                     |
| `support/`     | rotating log file, panic hook, clock, number formatting               |

- The folders are layers, top to bottom as listed: a module imports only the ones below it.
  `src/layers.rs` fails on a crossing.
- A new agent is one `tokens/<agent>.rs` implementing `TokenSource` and one line in
  `app/crediting.rs`.
- Coins and transcript positions are one record in `ledger.json`. Change them together
  through `AppState::credit`, so a crash rolls both back and nothing is credited twice.
- Clippy runs `pedantic` and `nursery` with `unwrap`, `expect`, `panic`, indexing, `as`
  casts and reasonless `allow` denied. Return errors, log them and keep running.
- Never hold the ledger lock across disk writes.
- Data lives in `~/.token-heroes`, outside the app, so a reinstall keeps progress.

## Content

- One entity per file. The registry collects files with `import.meta.glob`; no list to edit.
- A hero names its role, attack, attack interval and optional `focus`. Its strength, hire price
  and unlock come from its `order` through `designHero`; never write hero numbers by hand.
- Sprites are rows of palette slots: `a` body, `b` shade, `c` light, `e` eyes, `h` horns or
  bone, `x` darkest, `.` transparent. Fixed colours go in the sprite's `fixed` map.
- An element supplies the palette and the weather. A boss is a creature plus an element.
- `src/content/validate.test.ts` checks every entity. Fix the content, never the check.

## Balance

- After changing a hero, a foe or `src/engine/balance.ts`, run `pnpm balance` or the
  `check_balance` tool of the MCP server in `.mcp.json`, and fix what fails.
- The checks run the real engine. Never copy a formula into `src/balance`; export it from
  `@engine` instead. The game never imports `@balance`.
- See `docs/balance.md` for the rules and the tools.

## Economy

- One burned token is one coin. Only `src-tauri` adds coins.
- The UI spends coins through `@platform`; the host refuses a spend above the balance.
- Battle rewards nothing. Never add coin drops, kill bounties or interest.
- Ascension starts over for power: from stage 100 every hero returns to level 1 and the party
  to stage 1, and the party grows by the deepest stage reached. Levels are not refunded; heroes
  and unspent coins stay. It never gives coins.

## Code

- Keep files under 200 lines. Split by responsibility, not by line count.
- Name things so a comment is unnecessary. Write a comment only for a reason, a measurement
  or a constraint. Never restate the code or narrate a test.
- Keep balance numbers in `src/engine/balance.ts`.
- The engine is deterministic: randomness comes from the seeded generator in its state.
- Do not disable a lint rule with a comment.

## Commands

```bash
pnpm dev            # UI in a browser with a fake host
pnpm tauri dev      # the real tray app
pnpm check          # format, lint, types, tests, unused code
pnpm lint:rust      # clippy with warnings as errors
pnpm tauri build    # installers in src-tauri/target/release/bundle
```

The pre-commit hook formats and lints the staged files and runs the type checks, tests,
rustfmt and clippy that they touch. CI runs everything on every push and bundles macOS and
Windows installers.
