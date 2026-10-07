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
| `hero_sheets`    | hit, mend, HP, damage per second and next level cost at a level            |
| `stage_sheet`    | a stage's foes: HP, hit, interval and damage per second                    |
| `simulate_party` | runs a party until it is stuck and judges it at the stage that stopped it  |
| `check_balance`  | judges the standard parties, from 3 heroes at level 10 to all at level 150 |

## How the game is balanced

The numbers come from a model in [`src/engine/balance.ts`](../src/engine/balance.ts), so a new
hero, boss or tweak keeps the game in shape without hand-tuned stats.

- **Heroes are designed, not numbered.** A hero file names its role, attack, attack interval and
  an optional `focus` between offence and toughness. `designHero` turns its `order` in the
  roster into strength, hire price and unlock: every hero is 12% stronger per coin than the one
  before it, costs more to hire and unlocks later. A hero added at the end slots in on its own.
- **A boss has no timer; it fights until it or the party falls.** The party wins when it kills the
  boss before the boss kills it, so its damage times its toughness has to beat the boss's health
  times the boss's damage. Damage and health count alike: a stronger hit ends the fight before
  the party runs out of health.
- **Foes grow alike in health and damage**, 7% a stage, so that product grows by the same factor
  every stage and the fight at the wall lasts about as long at stage 300 as at stage 30: half a
  minute to a minute and a half.
- **Levels cost 7% more each, and every 25th level multiplies a hero's power by 4.** Together
  with the foes' growth this keeps each stage only a little dearer than the last, forever.
- **Ascension starts the game over for power.** From stage 100 every hero may go back to level 1
  and the party to stage 1; its power becomes (deepest stage ÷ 50)². Levels are not refunded, so
  the power is set to win the wall back with under half the tokens it took. The next ascension
  opens a quarter deeper than the last, which costs months of tokens, so it stays rare.
- **Healers undo a share of the foes' damage**, more when they keep up with the party's level.
  Each point of healer power makes the party last a quarter longer, so the shares of all healers
  add up to less than the whole: healing stretches a fight but never makes the party immortal.

## How a party is judged

A run starts a party at stage 1 and plays the real battle in quarter-second steps. A stage
that wipes the party twice in a row is its **frontier**, the place a player with that party is
stuck. Every party rule is measured there, because that is where the player spends their time.

Two players are modelled. The **even** player hires the heroes their burn has unlocked once a
hire costs a quarter of what they have burned, and levels the party together. The
**best-upgrade** player always buys whatever moves the party furthest per coin, including hiring
a hero and bringing it up to the party's level in one go. The pace rules hold the even player to
the targets and the best-upgrade player close to it, so no single way of spending wins by far.
The judged parties are the even player's after an hour, a day, a week, a month, a season, a year
and ten years of burned tokens. A new hero joins both players on its own.

## Rules

The rules live in [`src/balance/pace-rules.ts`](../src/balance/pace-rules.ts),
[`src/balance/play-rules.ts`](../src/balance/play-rules.ts),
[`src/balance/ascension-rules.ts`](../src/balance/ascension-rules.ts) and
[`src/balance/rules.ts`](../src/balance/rules.ts); `balance_rules` and `pnpm balance` always show
the current set.

| Pace rule                       | Passes when                                                      |
| ------------------------------- | ---------------------------------------------------------------- |
| `first-hour-feels-fast`         | 1M burned tokens reach stage 15 to 35                            |
| `first-day-reaches-mid-game`    | 10M burned tokens reach stage 40 to 60                           |
| `first-month-reaches-stage-100` | 300M burned tokens reach stage 90 to 120                         |
| `progress-never-stalls`         | late in the game, ten times more tokens still buy 35+ stages     |
| `rarer-heroes-are-upgrades`     | every hero is worth 5% more per coin than the hero before it     |
| `no-dominant-strategy`          | a best-upgrade player stays within 15 stages of an even one      |
| `active-play-is-a-bonus`        | clicking twice a second gains at most 15 stages                  |
| `ultimate-is-a-boost`           | one ultimate takes at most a quarter of the wall boss's health   |
| `ascension-pays-back`           | after ascending at the wall, half the tokens it took win it back |
| `ascension-pays-off`            | ten times the tokens later, an ascended party is 5+ stages ahead |

| Party rule                 | The party passes when                                          |
| -------------------------- | -------------------------------------------------------------- |
| `healers-keep-up`          | its healing undoes at least 20% of the foes' damage            |
| `bosses-still-threaten`    | its healing undoes at most 60% of the foes' damage             |
| `wall-fights-take-time`    | the fight that stops it lasts 15 seconds or longer             |
| `wall-fights-end`          | the fight that stops it lasts at most 3 minutes                |
| `bosses-are-the-wall`      | it gets stuck on a boss, never on a pack                       |
| `strikers-pull-weight`     | every striker deals at least 5% of the party's damage          |
| `tanks-hold-the-line`      | every tank holds twice an average striker's or healer's health |
| `no-wipes-before-the-wall` | it wipes at most once on the stages it goes on to clear        |

A test adds three made-up heroes after the last one and checks every pace rule still passes, so
the model is known to hold as the roster grows.

## Working on balance

1. Change a hero, a foe or a number in `src/engine/balance.ts`.
2. Run `pnpm balance` or call `check_balance`, and `simulate_party` with the party in question.
3. Fix what fails. A rule may change, but say why in the pull request; never loosen one only
   to make a check pass.
