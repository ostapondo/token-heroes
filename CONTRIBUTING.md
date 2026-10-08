# Contributing to Token Heroes

Thank you for stopping by. Token Heroes is small, young and open, and a first pull request can
land in an evening. This guide gets you from a fresh clone to a merged change.

- [Ways to help](#ways-to-help)
- [Set up](#set-up)
- [House rules](#house-rules)
- [Recipes](#recipes): a boss, an enemy, a hero, an element, a token source
- [Sprites](#sprites)
- [Pull requests](#pull-requests)

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to help

- **Content.** Bosses, enemies, heroes and elements are plain data files. Every one of the 72
  creature × element pairings has a boss; a new creature or element opens more.
- **Effects.** Weather kinds, particle presets and combat effects live in `src/render`.
- **Agents.** The host reads Claude Code, Codex, Gemini CLI, Qwen Code, OpenCode and Kilo Code
  today. Copilot CLI, Goose, Cline, Roo Code and Amp also write their usage to disk and are
  waiting for a token source.
- **Balance.** Every number that shapes the fight is in `src/engine/balance.ts`. `pnpm balance`
  plays the real battle and checks the rules in [docs/balance.md](docs/balance.md); agents get
  the same checks through an MCP server.
- **Platforms.** Most testing happens on macOS. Reports from Windows and Linux are gold.
- **Bugs and ideas.** [Open an issue](../../issues/new/choose). A clear report is a
  contribution too.

Not sure where to start? Look for issues labelled `good first issue`, or open one that says what
you'd like to try and we'll help you find a place.

## Set up

You need Node.js 22+, pnpm 10 (`corepack enable` picks the pinned version), Rust 1.85+ and the
[Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS.

```bash
pnpm install          # also installs the git hooks
pnpm dev              # the UI in a browser with a fake host: fastest for content and UI work
pnpm tauri dev        # the real tray app
```

Before you push, run both checks. The pre-commit hook runs them too.

```bash
pnpm check            # format, lint, types, tests, unused code
pnpm lint:rust        # clippy with warnings as errors
```

If you only touch content, `pnpm dev` and `pnpm test` cover you. You don't need the Rust
toolchain until you change `src-tauri`.

## House rules

These keep the codebase small and readable. [AGENTS.md](AGENTS.md) holds the same rules for
coding agents.

**Layers.** TypeScript in `src/` is split into layers, each reached only through its alias.
The linter fails on any crossing.

| Layer          | Alias       | May import                     |
| -------------- | ----------- | ------------------------------ |
| `src/engine`   | `@engine`   | nothing                        |
| `src/content`  | `@content`  | `@engine`                      |
| `src/render`   | `@render`   | `@engine`, `@content`, `@i18n` |
| `src/platform` | `@platform` | `@engine`                      |
| `src/i18n`     | `@i18n`     | nothing                        |
| `src/balance`  | `@balance`  | `@engine`, `@content`          |
| `src/ui`       | none        | every alias but `@balance`     |

Game rules stay in TypeScript. The Rust host watches transcripts, owns the coin ledger, stores
saves and draws the tray, and nothing more.

**Economy.** One burned token is one coin, and only the host adds coins. Battle rewards nothing:
no coin drops, no kill bounties, no interest. A pull request that pays coins for fighting will be
declined, however fun it is. The game exists to turn real work into progress.

**Code.**

- One entity per content file. The registry collects files with `import.meta.glob`, so there is
  no list to edit.
- Keep files under 200 lines. Split them by responsibility, not by line count.
- Name things so a comment is unnecessary. Write a comment only for a reason, a measurement or a
  constraint.
- Keep balance numbers in `src/engine/balance.ts`.
- The engine is deterministic. Randomness comes from the seeded generator in its state, never
  from `Math.random()`.
- Don't disable a lint rule with a comment. If a rule is wrong, say so in the pull request.
- `src/content/validate.test.ts` checks every entity. When it fails, fix the content, never the
  check.

## Recipes

### Add a boss

A boss is a creature drawn in an element. It needs no sprite of its own.

1. Pick a creature and an element that no boss in `src/content/bosses` uses yet. Each pairing
   appears once, and the content check fails on a repeat. All 72 pairings are taken, so a new
   boss comes with a new creature or element.
2. Create `src/content/bosses/<id>.ts`:

   ```ts
   import { defineBoss } from '../model/definitions';
   import { CreatureId, ElementId } from '../model/ids';

   export default defineBoss({
     id: 'storm-treant',
     name: 'Storm Treant',
     order: 73,
     creature: CreatureId.Treant,
     element: ElementId.Storm,
   });
   ```

3. `order` is the boss's place in the run. Orders must run from 1 to the number of bosses with no
   gaps, so a new boss takes the next number.
4. Run `pnpm test`, then `pnpm dev` and watch it fight.
5. Run `pnpm balance` to see how the new boss changes where parties get stuck.

### Add an enemy

Enemies make up the packs between bosses. Each has its own small sprite, painted in the element
of the stage it appears on.

```ts
import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'goblin',
  name: 'Goblin',
  hpScale: 1.0,
  damageScale: 1.0,
  sprite: {
    rows: [
      '...aaaa...',
      '..aeaeaa..',
      '...aaaa...',
      '.s.bbbb...',
      '.sabbbba..',
      '.sabbbba..',
      '...bbbb...',
      '...x..x...',
      '...x..x...',
      '...x..x...',
    ],
    fixed: { s: '#c9d1d9' },
  },
});
```

Keep `hpScale` and `damageScale` near 1.0 unless the enemy is meant to stand out, and say why in
the pull request.

### Add a hero

Heroes live in `src/content/heroes/`. A hero names its role (`Striker`, `Tank` or `Healer`), its
attack style and attack interval, and may lean its `focus` towards offence (up to `0.5`) or
toughness (down to `-0.5`). It never sets damage, health or prices: `designHero` derives them
from its `order`, so a hero with the next `order` is automatically stronger per coin, dearer to
hire and unlocked later than the last one. Hero sprites use `fixed` colours only, since no
element recolours them.

Every hero needs a skill in `src/content/skills/`; a second skill takes `slot: 2`. A skill names
its `hero`, its `trigger` (`Cooldown` with a `cooldown`, or `OnHit` or `OnGuard` with a `chance`)
and its `effects`, whose `share`s add up to 1. Like the hero, it sets no strength of its own: it
spends a share of the hero's output, more with every rank. It also names its rank-five form in
`evolved`, a `look` from `SkillLook` that `src/render` draws, a `color` and a 12×12 `icon` in
fixed colours.

Run `pnpm balance` before you open the pull request, and open an issue first to describe the
role the hero fills.

### Add an element

An element supplies a palette, an accent colour, a backdrop (sky and ground bands plus scenery
pieces), a list of weather effects and the `death` that fells a party in it.
`src/render/backdrop/readability.test.ts` checks that sprites stay readable against the backdrop.

1. Add its id to `ElementId` in `src/content/model/ids.ts`.
2. Create `src/content/elements/<id>.ts` with `defineElement`. Every colour is a lowercase
   `#rrggbb`.
3. Build its weather from the existing `WeatherKind` and `ParticlePreset` values in
   `src/content/model/weather.ts`. A new kind of weather also needs a renderer in
   `src/render/weather`.
4. An element is only seen on a boss or an enemy. Give it a boss for every creature, so each
   creature still appears in every element.

### Add a token source

A token source teaches the host to read another agent's transcripts. It lives in
`src-tauri/src/tokens/` and implements one trait:

```rust
pub trait TokenSource: Send {
    fn agent(&self) -> Agent;
    fn root(&self) -> &Path;
    fn burn_in(&self, line: &str, memory: &mut LineMemory<'_>) -> Result<Burn, serde_json::Error>;
}
```

- `agent` names the agent in the menu's Stats tab. Add it to `Agent` in `burn.rs`.
- `root` is the folder to watch. The collector reads every `.jsonl` file below it, a line at a
  time, and remembers how far it got.
- `burn_in` returns what one line burned: its input, output, cache writes and cache reads, and
  the model and project folder when the line names them. Skip lines without usage cheaply,
  before parsing JSON. `LineMemory` helps with agents that write one message on several lines or
  in several files (`message_growth`) and with agents that log a running total
  (`cursor.running_total`).
- Count every token the agent sends or receives, cache reads included.
- Resolve the root in `src-tauri/src/persistence/paths.rs`, honouring the agent's own home
  variable if it has one, and register the source in `src-tauri/src/app/crediting.rs`.
- Add unit tests with real transcript lines, like those in `claude.rs` and `codex.rs`. Strip any
  personal content from them first.

An agent that keeps its sessions in a database instead implements `StoreSource`, like
`opencode.rs`: it names itself, watches its folder and reads every new reply since its cursor's
watermark. A reply that grows while it streams is credited only for its growth, through the
cursor's `seen` messages. Register it with `with_stores` in `src-tauri/src/app/crediting.rs`.

## Sprites

A sprite is a list of equal-width strings, one character per pixel.

| Char | Meaning       |
| ---- | ------------- |
| `a`  | body          |
| `b`  | shade         |
| `c`  | light         |
| `e`  | eyes          |
| `h`  | horns or bone |
| `x`  | darkest       |
| `.`  | transparent   |

The element's palette fills those slots, so one creature looks different in every element. Any
other letter is a fixed colour that you declare in the sprite's `fixed` map. The renderer adds the
black outline, so don't draw one.

The concept boards in [`docs/concepts`](docs/concepts) are the visual reference: muted grounds,
one strong accent per element, chunky readable silhouettes.

## Pull requests

- Keep one change per pull request. Three bosses can share one; a boss and a balance change
  should not.
- Write commit messages in the style of the history:
  `feat(content): add the thunder golem`, `fix(engine): …`, `docs: …`.
  The scopes are `engine`, `content`, `render`, `platform`, `ui`, `i18n`, `balance`, `site` and
  `host`.
- Add a screenshot or a short clip for anything you can see.
- Make sure `pnpm check` passes, and `pnpm lint:rust` if you touched `src-tauri`.
- Coding agents are welcome. Review what yours wrote as if you wrote it yourself.

By contributing you agree that your work is released under the [MIT License](LICENSE).

## Releasing

Maintainers ship a release from a tag, and every installed copy offers it in the menu's About tab.

1. Raise the version in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`.
2. Tag the commit `v<version>` and push the tag. The release workflow builds macOS and Windows
   installers, signs the update bundles and drafts a GitHub release with `latest.json`.
3. Read the draft, then publish it. The game checks
   `releases/latest/download/latest.json` when its window opens and every six hours while it
   stays open.

The workflow needs two repository secrets: `TAURI_SIGNING_PRIVATE_KEY` and
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. The matching public key is in `tauri.conf.json`. An update
signed with any other key is refused, so keep the private key backed up.
