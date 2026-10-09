import {
  bossById,
  creatureById,
  enemyById,
  findSuperBoss,
  heroDefById,
  type Content,
  type ElementDef,
  type Look,
  type Palette,
} from '@content';
import type { BattleState, PartyState } from '@engine';
import { Body } from './body';
import { FIELD, type Frame } from './field';

// Gear changes every 25 levels; past the fourth step a hero has all of it.
const TIER_LEVELS = 25;
const TOP_TIER = 4;
const BOSS_DEPTH = 0.55;

const spread = (index: number): number => (index * 0.37 + 0.12) % 1;

// Every body on the floor: heroes by id, the stage's foes by the rules' index, and the fallen of
// earlier stages fading out.
export class Cast {
  readonly heroes = new Map<string, Body>();
  foes: Body[] = [];
  corpses: Body[] = [];
  readonly #content: Content;
  #foeKey = '';
  #generation = 0;

  constructor(content: Content) {
    this.#content = content;
  }

  get all(): Body[] {
    return [...this.heroes.values(), ...this.foes, ...this.corpses];
  }

  hero(id: string): Body | undefined {
    return this.heroes.get(id);
  }

  foe(index: number): Body | undefined {
    return this.foes[index];
  }

  // Returns the heroes who just joined, so the director can greet them.
  syncHeroes(party: PartyState, palette: Palette, frame: Frame): string[] {
    const first = this.heroes.size === 0;
    const keep = new Set(party.heroes.map((slot) => slot.heroId));
    const joined: string[] = [];

    for (const id of this.heroes.keys()) if (!keep.has(id)) this.heroes.delete(id);
    party.heroes.forEach((slot, index) => {
      const body =
        this.heroes.get(slot.heroId) ?? this.#hire(slot.heroId, index, first, palette, frame);

      if (!this.heroes.has(slot.heroId)) {
        this.heroes.set(slot.heroId, body);
        if (!first) joined.push(slot.heroId);
      }
      body.tier = Math.min(TOP_TIER, Math.floor(slot.level / TIER_LEVELS));
    });

    return joined;
  }

  // A new stage, element or respawn brings a new pack in from both edges of the floor.
  syncFoes(battle: BattleState, element: ElementDef, frame: Frame): boolean {
    const key = [
      battle.stage,
      element.id,
      this.#generation,
      ...battle.foes.map((foe) => foe.id),
    ].join('|');

    if (key === this.#foeKey) return false;
    this.#foeKey = key;
    for (const body of this.foes) this.#retire(body);
    this.foes = battle.foes.map((foe, index) => {
      const { look, palette } = foe.boss
        ? this.#bossLook(foe.id, element)
        : this.#enemyLook(foe.id, element);
      const right = foe.boss || index % 2 === 0;
      const x = right ? FIELD.width - 14 - index * 6 : frame.left + 14 + index * 6;

      return new Body({
        look,
        palette,
        hero: false,
        boss: foe.boss,
        x,
        z: foe.boss ? BOSS_DEPTH : spread(index),
        facing: right ? -1 : 1,
      });
    });

    return true;
  }

  // The rules restarted the same stage: the pack comes back even though nothing about it changed.
  renew(): void {
    this.#generation += 1;
  }

  #retire(body: Body): void {
    if (body.dead) {
      this.corpses.push(body);

      return;
    }
    body.alpha = 0;
  }

  #hire(heroId: string, index: number, first: boolean, palette: Palette, frame: Frame): Body {
    const hero = heroDefById(this.#content, heroId);
    const room = Math.max(60, FIELD.width - 160 - frame.left);

    return new Body({
      look: hero.look,
      palette,
      tint: hero.tint,
      hero: true,
      boss: false,
      x: first ? frame.left + 40 + ((index * 53) % room) : frame.left + 10,
      z: first ? (index * 0.37) % 1 : 0.2 + Math.random() * 0.6,
      facing: 1,
    });
  }

  // A super boss wears its own colours; any other boss is its creature in the element's.
  #bossLook(bossId: string, element: ElementDef): { look: Look; palette: Palette } {
    const superBoss = findSuperBoss(this.#content, bossId);

    if (superBoss) return { look: superBoss.look, palette: superBoss.palette };
    const creature = creatureById(this.#content, bossById(this.#content, bossId).creature);

    return { look: creature.look, palette: element.palette };
  }

  #enemyLook(enemyId: string, element: ElementDef): { look: Look; palette: Palette } {
    return { look: enemyById(this.#content, enemyId).look, palette: element.palette };
  }
}
