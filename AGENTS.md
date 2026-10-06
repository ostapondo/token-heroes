# Token Heroes repository instructions

Token Heroes is an endless idle RPG that lives in the system tray. Coins are the tokens
your coding agents burn. The fight never gives coins; a stuck party needs more burned
tokens to level up.

## Layers

TypeScript in `src/` is split into layers. Each layer is reached only through its alias,
never through a path behind it. `.oxlintrc.json` fails on a crossing.

| Layer          | Alias       | May import            | Holds                                                       |
| -------------- | ----------- | --------------------- | ----------------------------------------------------------- |
| `src/engine`   | `@engine`   | nothing               | game rules: stages, battle, levels, offline progress        |
| `src/content`  | `@content`  | `@engine`             | data: sprites, elements, creatures, bosses, enemies, heroes |
| `src/render`   | `@render`   | `@engine`, `@content` | canvas drawing, sprite cache, weather and combat effects    |
| `src/platform` | `@platform` | `@engine`             | the Tauri host: wallet, saves, events                       |
| `src/ui`       | none        | every alias           | React screens and the HUD                                   |

`src-tauri` is the Rust host. It watches agent transcripts, owns the coin ledger, stores
saves and draws the tray. Game rules never move into Rust.

## Content

- One entity per file. The registry collects files with `import.meta.glob`; no list to edit.
- Sprites are rows of palette slots: `a` body, `b` shade, `c` light, `e` eyes, `h` horns or
  bone, `x` darkest, `.` transparent. Fixed colours go in the sprite's `fixed` map.
- An element supplies the palette and the weather. A boss is a creature plus an element.
- `src/content/validate.test.ts` checks every entity. Fix the content, never the check.

## Economy

- One burned token is one coin. Only `src-tauri` adds coins.
- The UI spends coins through `@platform`; the host refuses a spend above the balance.
- Battle rewards nothing. Never add coin drops, kill bounties or interest.

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
```

Run `pnpm check` and `pnpm lint:rust` before every commit.
