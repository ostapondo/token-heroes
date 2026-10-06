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

## How a party is judged

A run starts a party at stage 1 and plays the real battle in quarter-second steps. A stage
that wipes the party twice in a row is its **frontier**, the place a player with that party is
stuck. Every rule is measured there, because that is where the player spends their time.

The standard parties grow the way players grow theirs: the next heroes in hiring order,
levelled together. A new hero joins them as soon as its file exists.

## Rules

The rules live in [`src/balance/rules.ts`](../src/balance/rules.ts); `balance_rules` and
`pnpm balance` always show the current set.

| Rule                            | The party passes when                                    |
| ------------------------------- | -------------------------------------------------------- |
| `healers-keep-up`               | its healing undoes at least 20% of the frontier's damage |
| `party-outlasts-half-the-timer` | its health lasts half the frontier boss timer or longer  |
| `bosses-are-the-wall`           | it gets stuck on a boss, never on a pack                 |
| `strikers-pull-weight`          | every striker deals at least 5% of the party's damage    |
| `tanks-hold-the-line`           | every tank holds at least 15% of the party's health      |
| `no-wipes-before-the-wall`      | it wipes at most once on the stages it goes on to clear  |

## Working on balance

1. Change a hero, a foe or a number in `src/engine/balance.ts`.
2. Run `pnpm balance` or call `check_balance`, and `simulate_party` with the party in question.
3. Fix what fails. A rule may change, but say why in the pull request; never loosen one only
   to make a check pass.
