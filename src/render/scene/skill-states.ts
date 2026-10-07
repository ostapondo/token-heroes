import { type Content, elementById, enemyById, SkillLook, skillDefById } from '@content';
import { type BattleState, formTier, type PartyState, skillRank } from '@engine';
import { withAlpha } from '../color';
import { FX_COLOR } from '../fx/colors';
import type { SpriteCache } from '../sprites/sprite-cache';
import type { Actor } from './cast';
import { center } from './geometry';

interface Scene {
  readonly heroes: readonly Actor[];
  readonly foes: readonly Actor[];
  readonly sprites: SpriteCache;
}

const STATUS = { mark: '#ff5b4a', flame: ['#ffd36a', '#ff8a3a', '#ff5a1f'] } as const;
const DOME = { fill: 0.14, rim: 0.9, rows: 4, gap: 6 } as const;
const GUARD = { enemy: 'skeleton', element: 'bone', key: 'guard:skeleton', step: 10 } as const;

function paintStun(context: CanvasRenderingContext2D, actor: Actor, clock: number): void {
  const middle = center(actor.box).x;

  for (let star = 0; star < 3; star += 1) {
    const angle = clock * 6 + (star * Math.PI * 2) / 3;
    const x = Math.round(middle + Math.cos(angle) * 7);
    const y = Math.round(actor.box.y - 5 + Math.sin(angle) * 2);

    context.fillStyle = star === 0 ? FX_COLOR.steel : FX_COLOR.gold;
    context.fillRect(x, y - 1, 1, 3);
    context.fillRect(x - 1, y, 3, 1);
  }
}

function paintBurn(context: CanvasRenderingContext2D, actor: Actor, clock: number): void {
  const { box } = actor;

  for (let flame = 0; flame < 5; flame += 1) {
    const x = box.x + ((flame * 37 + Math.floor(clock * 9) * 11) % Math.max(1, box.width));
    const rise = (clock * 30 + flame * 7) % 12;

    context.fillStyle = STATUS.flame[Math.min(2, Math.floor(rise / 4))] ?? FX_COLOR.ember;
    context.fillRect(
      Math.round(x),
      Math.round(box.y + box.height * 0.5 - rise),
      rise < 6 ? 2 : 1,
      rise < 6 ? 2 : 1,
    );
  }
}

function paintMark(context: CanvasRenderingContext2D, actor: Actor, clock: number): void {
  if (Math.floor(clock * 4) % 4 === 0) return;
  const middle = center(actor.box);
  const reach = Math.max(actor.box.width, actor.box.height) / 2 + 2;

  context.fillStyle = STATUS.mark;
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    context.fillRect(
      Math.round(middle.x + sx * reach - (sx > 0 ? 3 : 0)),
      Math.round(middle.y + sy * reach),
      4,
      1,
    );
    context.fillRect(
      Math.round(middle.x + sx * reach - (sx > 0 ? 1 : 0)),
      Math.round(middle.y + sy * reach - (sy > 0 ? 3 : 0)),
      1,
      4,
    );
  }
}

// A foe's stun, burn and mark, drawn from the battle so they show after a reload too.
function paintStatuses(
  context: CanvasRenderingContext2D,
  scene: Scene,
  battle: BattleState,
  clock: number,
) {
  battle.foes.forEach((foe, index) => {
    const actor = scene.foes[index];

    if (!actor || foe.hp <= 0) return;
    if ((foe.stunned ?? 0) > 0) paintStun(context, actor, clock);
    if (foe.burn) paintBurn(context, actor, clock);
    if (foe.mark) paintMark(context, actor, clock);
  });
}

function paintDome(
  context: CanvasRenderingContext2D,
  heroes: readonly Actor[],
  color: string,
  clock: number,
) {
  const left = Math.min(...heroes.map((hero) => hero.box.x)) - 4;
  const right = Math.max(...heroes.map((hero) => hero.box.x + hero.box.width)) + 4;
  const top = Math.min(...heroes.map((hero) => hero.box.y)) - 6;
  const base = Math.max(...heroes.map((hero) => hero.box.y + hero.box.height)) + 2;
  const middle = (left + right) / 2;
  const half = (right - left) / 2;
  const height = base - top;

  context.fillStyle = withAlpha(color, DOME.fill);
  context.beginPath();
  for (let y = 0; y < height; y += 1) {
    const span = Math.round(half * Math.sqrt(1 - (y / height) ** 2));

    context.rect(Math.round(middle - span), base - y, span * 2, 1);
  }
  context.fill();
  context.fillStyle = withAlpha(color, DOME.rim);
  context.beginPath();
  for (let step = 0; step <= 90; step += 1) {
    if (Math.floor(clock * 8 + step / 4) % 6 === 0) continue;
    const angle = (step / 90) * Math.PI;

    context.rect(
      Math.round(middle - Math.cos(angle) * half),
      Math.round(base - Math.sin(angle) * height),
      1,
      1,
    );
  }
  context.fill();
}

function paintGuards(
  context: CanvasRenderingContext2D,
  scene: Scene,
  content: Content,
  count: number,
) {
  const sprite = enemyById(content, GUARD.enemy).sprite;
  const bitmap = scene.sprites.get(GUARD.key, sprite, elementById(content, GUARD.element).palette);
  const pixel = scene.heroes[0]?.pixel ?? 2;
  const front = Math.max(...scene.heroes.map((hero) => hero.box.x + hero.box.width));
  const floor = Math.max(...scene.heroes.map((hero) => hero.box.y + hero.box.height));

  for (let guard = 0; guard < count; guard += 1) {
    const width = bitmap.width * pixel;
    const height = bitmap.height * pixel;

    context.drawImage(
      bitmap,
      front + 2 + guard * GUARD.step,
      floor - height + pixel - guard * 3,
      width,
      height,
    );
  }
}

// The party's shield as the skill that raised it: a dome, or skeletons standing in front.
function paintShield(
  context: CanvasRenderingContext2D,
  scene: Scene,
  battle: BattleState,
  party: PartyState,
  content: Content,
  clock: number,
) {
  const shield = battle.shield;

  if (!shield || scene.heroes.length === 0) return;
  const skill = skillDefById(content, shield.skill);
  const level = party.heroes.find((slot) => slot.heroId === skill.hero)?.level ?? 1;

  if (skill.look === SkillLook.RaiseDead)
    paintGuards(context, scene, content, formTier(skillRank(level)) + 1);
  else paintDome(context, scene.heroes, skill.color, clock);
}

export function paintSkillStates(
  context: CanvasRenderingContext2D,
  scene: Scene,
  snapshot: { readonly battle: BattleState; readonly party: PartyState },
  content: Content,
  clock: number,
): void {
  paintStatuses(context, scene, snapshot.battle, clock);
  paintShield(context, scene, snapshot.battle, snapshot.party, content, clock);
}
