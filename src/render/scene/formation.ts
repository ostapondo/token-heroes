import { AttackStyle } from '@engine';
import { ARENA, type Box } from './geometry';

interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Recruit {
  readonly attack: AttackStyle;
  readonly size: Size;
}

// Each rank stands higher and further back than the one before it, so a hero behind shows
// its head and shoulders above the rank in front, and every second hero in a rank steps back
// a little so neighbours do not hide each other's faces. Tuned so a full party of ten keeps
// three quarters of every head in view; the front rank stops short of the pack.
const RANKS = [
  { feet: ARENA.height - 10, right: 88 },
  { feet: ARENA.height - 22, right: 84 },
  { feet: ARENA.height - 34, right: 76 },
] as const;
const STEP_BACK = 4;
const PARTY_LEFT = 2;
const MAX_SPACING = 26;
const PER_RANK = 4;

const PREFERRED_RANK: Record<AttackStyle, number> = {
  [AttackStyle.Bash]: 0,
  [AttackStyle.Slash]: 0,
  [AttackStyle.Arrow]: 1,
  [AttackStyle.Spell]: 1,
  [AttackStyle.Heal]: 2,
};

function rankFor(preferred: number, filled: readonly number[]): number {
  const behind = RANKS.map((_, offset) => (preferred + offset) % RANKS.length);

  return behind.find((rank) => (filled[rank] ?? 0) < PER_RANK) ?? preferred;
}

function assignRanks(recruits: readonly Recruit[]): number[] {
  const filled = RANKS.map(() => 0);
  const byReach = recruits
    .map((recruit, index) => ({ index, preferred: PREFERRED_RANK[recruit.attack] }))
    .toSorted((left, right) => left.preferred - right.preferred);
  const ranks = recruits.map(() => 0);

  for (const { index, preferred } of byReach) {
    const rank = rankFor(preferred, filled);

    ranks[index] = rank;
    filled[rank] = (filled[rank] ?? 0) + 1;
  }

  return ranks;
}

// Tanks step to the front of their rank, nearest the foes; melee strikers stand beside them.
const nearestFoeFirst = (recruits: readonly Recruit[]) => (left: number, right: number) =>
  Number(recruits[left]?.attack !== AttackStyle.Bash) -
  Number(recruits[right]?.attack !== AttackStyle.Bash);

export function partyFormation(recruits: readonly Recruit[]): Box[] {
  const ranks = assignRanks(recruits);
  const boxes: Box[] = [];

  RANKS.forEach((rank, rankIndex) => {
    const members = recruits
      .map((_, index) => index)
      .filter((index) => ranks[index] === rankIndex)
      .toSorted(nearestFoeFirst(recruits));
    const widest = Math.max(0, ...members.map((index) => recruits[index]?.size.width ?? 0));
    const room = rank.right - PARTY_LEFT - widest;
    const spacing = members.length > 1 ? Math.min(MAX_SPACING, room / (members.length - 1)) : 0;

    members.forEach((index, column) => {
      const size = recruits[index]?.size ?? { width: 0, height: 0 };

      boxes[index] = {
        x: Math.round(rank.right - size.width - column * spacing),
        y: rank.feet - (column % 2 === 0 ? 0 : STEP_BACK) - size.height,
        ...size,
      };
    });
  });

  return boxes;
}
