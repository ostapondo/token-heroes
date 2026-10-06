# Balance checks

Token Heroes measures its balance with its own engine. The checks run the same battle code and
read the same content files as the game, so a failed rule is a problem a player will meet.

## Run them

| How                    | Command                     | For                                     |
| ---------------------- | --------------------------- | --------------------------------------- |
| Report in the terminal | `pnpm balance`              | a quick look after a change             |
| Fail on any finding    | `pnpm balance -- --strict`  | CI, once the current findings are fixed |
| MCP server             | `pnpm --silent balance:mcp` | coding agents                           |

Claude Code picks the server up from `.mcp.json` in the repository root. Any other MCP client
starts it with the same command over stdio.

## MCP tools

| Tool             | What it returns                                                            |
| ---------------- | -------------------------------------------------------------------------- |
| `balance_rules`  | every rule, why it exists and its threshold                                |
| `hero_sheets`    | hit, heal, HP, damage and healing per second, next level cost at a level   |
| `stage_sheet`    | a stage's foes: HP, hit, interval, damage per second and the boss timer    |
| `simulate_party` | runs a party until it is stuck and judges it at the stage that stopped it  |
| `check_balance`  | judges the standard parties, from 3 heroes at level 10 to all at level 150 |

## How the game is balanced

The numbers come from a model in [`src/engine/balance.ts`](../src/engine/balance.ts), so a new
hero, boss or tweak keeps the game in shape without hand-tuned stats.

- **Heroes are designed, not numbered.** A hero file names its role, attack, attack interval and
  an optional `focus` between offence and toughness. `designHero` turns its `order` in the
  roster into strength, hire price and unlock: every hero is 12% stronger per coin than the one
  before it, costs more to hire and unlocks later. A hero added at the end slots in on its own.
- **Foes grow alike in health and damage**, 7% a stage. The time a party needs to kill a boss
  times the time the boss needs to kill the party is then the same at every stage. It is set so
  both walls meet near the 30-second timer: sturdy bosses test damage, savage bosses test tanks
  and healers.
- **Levels cost 7% more each, and every 25th level multiplies a hero's power by 4.** Together
  with the foes' growth this keeps each stage only a little dearer than the last, forever.
- **Healers restore a share of the party's health**, more when they keep up with the party's
  level, so healing scales with everything else instead of falling behind.

## How a party is judged

A run starts a party at stage 1 and plays the real battle in quarter-second steps. A stage
that wipes the party twice in a row is its **frontier**, the place a player with that party is
stuck. Every party rule is measured there, because that is where the player spends their time.

The judged parties are the ones a player owns after an hour, a day, a week, a month, a season,
a year and ten years of burned tokens: the heroes their burn has unlocked, hired once a hire
costs a quarter of what they have burned, levelled together. A new hero joins them on its own.

## Rules

The rules live in [`src/balance/pace-rules.ts`](../src/balance/pace-rules.ts) and
[`src/balance/rules.ts`](../src/balance/rules.ts); `balance_rules` and `pnpm balance` always show
the current set.

| Pace rule                       | Passes when                                                  |
| ------------------------------- | ------------------------------------------------------------ |
| `first-hour-feels-fast`         | 1M burned tokens reach stage 15 to 35                        |
| `first-day-reaches-mid-game`    | 10M burned tokens reach stage 40 to 60                       |
| `first-month-reaches-stage-100` | 300M burned tokens reach stage 90 to 120                     |
| `progress-never-stalls`         | late in the game, ten times more tokens still buy 35+ stages |
| `rarer-heroes-are-upgrades`     | every hero is worth 5% more per coin than the hero before it |

| Party rule                   | The party passes when                                     |
| ---------------------------- | --------------------------------------------------------- |
| `healers-keep-up`            | its healing undoes at least 20% of the frontier's damage  |
| `party-outlasts-the-opening` | its health lasts 40% of the frontier boss timer or longer |
| `bosses-are-the-wall`        | it gets stuck on a boss, never on a pack                  |
| `strikers-pull-weight`       | every striker deals at least 5% of the party's damage     |
| `tanks-hold-the-line`        | every tank holds at least 15% of the party's health       |
| `no-wipes-before-the-wall`   | it wipes at most once on the stages it goes on to clear   |

A test adds three made-up heroes after the last one and checks every pace rule still passes, so
the model is known to hold as the roster grows.

## Working on balance

1. Change a hero, a foe or a number in `src/engine/balance.ts`.
2. Run `pnpm balance` or call `check_balance`, and `simulate_party` with the party in question.
3. Fix what fails. A rule may change, but say why in the pull request; never loosen one only
   to make a check pass.
