import { CONTENT, toRoster } from '@content';
import {
  checkBalance,
  heroSheet,
  judgeParty,
  PACE_RULES,
  RULES,
  stageSheet,
  standardScenarios,
} from '@balance';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const roster = toRoster(CONTENT);
const level = z.number().int().min(1).max(10_000);
const member = z.object({ heroId: z.enum(CONTENT.heroes.map((hero) => hero.id)), level });

const INSTRUCTIONS = `Measures Token Heroes balance with the game's own engine and content.
Every number comes from the same code the game runs, so a finding here is a finding in the game.
Workflow: after adding or changing a hero, boss, enemy or a number in src/engine/balance.ts,
call check_balance and fix what fails. To look into a player's complaint, call simulate_party
with their party. The rules and their thresholds live in src/balance/rules.ts.`;

function reply(work: () => unknown): CallToolResult {
  try {
    return { content: [{ type: 'text', text: JSON.stringify(work(), null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: String(error) }], isError: true };
  }
}

const server = new McpServer(
  { name: 'token-heroes-balance', version: '0.1.0' },
  { instructions: INSTRUCTIONS },
);

server.registerTool(
  'balance_rules',
  { description: 'The balance rules, why each exists and the threshold it must meet.' },
  () =>
    reply(() =>
      [...PACE_RULES, ...RULES].map(({ id, statement, why, threshold }) => ({
        id,
        statement,
        why,
        threshold,
      })),
    ),
);

server.registerTool(
  'hero_sheets',
  {
    description: 'Hit, heal, HP, per-second output and next level cost of heroes at a level.',
    inputSchema: { level, heroIds: z.array(member.shape.heroId).optional() },
  },
  ({ level: at, heroIds }) =>
    reply(() =>
      (heroIds ?? CONTENT.heroes.map((hero) => hero.id)).map((id) => heroSheet(roster, id, at)),
    ),
);

server.registerTool(
  'stage_sheet',
  {
    description: 'The foes of a stage: HP, hit, interval, damage per second and the boss timer.',
    inputSchema: { stage: z.number().int().min(1).max(100_000) },
  },
  ({ stage }) => reply(() => stageSheet(roster, stage)),
);

server.registerTool(
  'simulate_party',
  {
    description:
      'Runs a party through the real battle from a stage until it is stuck, then judges it ' +
      'against every rule at the stage that stopped it.',
    inputSchema: {
      party: z.array(member).min(1),
      fromStage: z.number().int().min(1).optional(),
      maxMinutes: z
        .number()
        .min(1)
        .max(24 * 60)
        .optional(),
      strikesPerSecond: z.number().min(0).max(10).optional(),
    },
  },
  ({ party, fromStage, maxMinutes, strikesPerSecond }) =>
    reply(() =>
      judgeParty(
        roster,
        { name: 'requested party', party },
        {
          ...(fromStage === undefined ? {} : { fromStage }),
          ...(maxMinutes === undefined ? {} : { maxSeconds: maxMinutes * 60 }),
          ...(strikesPerSecond === undefined ? {} : { strikesPerSecond }),
        },
      ),
    ),
);

server.registerTool(
  'check_balance',
  {
    description:
      'Judges the pace of the game and the parties a player owns after an hour, a day, a ' +
      'month and a year of burned tokens. Run it after any change to heroes, foes or balance.',
  },
  () => reply(() => checkBalance(roster, standardScenarios(roster))),
);

await server.connect(new StdioServerTransport());
