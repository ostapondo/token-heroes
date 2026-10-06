import {
  bossById,
  creatureById,
  enemyById,
  heroDefById,
  type Content,
  type CreatureAttack,
  type ElementDef,
  type Palette,
  type SpriteDef,
} from '@content';
import type { BattleState, PartyState } from '@engine';
import { spriteSize } from '../sprites/pixels';
import type { SpriteCache } from '../sprites/sprite-cache';
import { SPRITE_SCALE, type Box } from './geometry';
import { partyFormation } from './formation';
import { bossSlot, packSlot } from './layout';
import { Motion } from './motion';

export interface Actor {
  readonly id: string;
  readonly boss: boolean;
  readonly attack: CreatureAttack | null;
  readonly key: string;
  readonly sprite: SpriteDef;
  readonly palette: Palette | undefined;
  readonly box: Box;
  readonly pixel: number;
  readonly motion: Motion;
}

const scaled = (sprite: SpriteDef, scale: number) => {
  const { width, height } = spriteSize(sprite);

  return { width: width * scale, height: height * scale };
};

export class Cast {
  readonly #content: Content;
  readonly #sprites: SpriteCache;
  #heroes: Actor[] = [];
  #foes: Actor[] = [];
  #heroKey = '';
  #foeKey = '';

  constructor(content: Content, sprites: SpriteCache) {
    this.#content = content;
    this.#sprites = sprites;
  }

  get heroes(): readonly Actor[] {
    return this.#heroes;
  }

  get foes(): readonly Actor[] {
    return this.#foes;
  }

  get sprites(): SpriteCache {
    return this.#sprites;
  }

  hero(id: string): Actor | undefined {
    return this.#heroes.find((actor) => actor.id === id);
  }

  sync(battle: BattleState, party: PartyState, element: ElementDef): void {
    const heroKey = party.heroes.map((slot) => slot.heroId).join('|');

    if (heroKey !== this.#heroKey) {
      this.#heroKey = heroKey;
      const heroes = party.heroes.map((slot) => heroDefById(this.#content, slot.heroId));
      const boxes = partyFormation(
        heroes.map((hero) => ({
          attack: hero.attack,
          size: scaled(hero.sprite, SPRITE_SCALE.hero),
        })),
      );

      this.#heroes = heroes.map((hero, index) =>
        this.#heroActor(hero.id, boxes[index] ?? { x: 0, y: 0, width: 0, height: 0 }),
      );
    }
    const foeKey = [battle.stage, element.id, ...battle.foes.map((foe) => foe.id)].join('|');

    if (foeKey !== this.#foeKey) {
      this.#foeKey = foeKey;
      this.#foes = battle.foes.map((foe, index) =>
        foe.boss ? this.#bossActor(foe.id, element) : this.#enemyActor(foe.id, index, element),
      );
    }
  }

  #heroActor(heroId: string, box: Box): Actor {
    const sprite = heroDefById(this.#content, heroId).sprite;

    return {
      id: heroId,
      boss: false,
      attack: null,
      key: `hero:${heroId}`,
      sprite,
      palette: undefined,
      box,
      pixel: SPRITE_SCALE.hero,
      motion: this.hero(heroId)?.motion ?? new Motion(),
    };
  }

  #bossActor(bossId: string, element: ElementDef): Actor {
    const boss = bossById(this.#content, bossId);
    const creature = creatureById(this.#content, boss.creature);
    const { sprite } = creature;

    return {
      id: bossId,
      boss: true,
      attack: creature.attack,
      key: `boss:${boss.creature}:${element.id}`,
      sprite,
      palette: element.palette,
      box: bossSlot(scaled(sprite, SPRITE_SCALE.boss)),
      pixel: SPRITE_SCALE.boss,
      motion: new Motion(),
    };
  }

  #enemyActor(enemyId: string, index: number, element: ElementDef): Actor {
    const sprite = enemyById(this.#content, enemyId).sprite;

    return {
      id: enemyId,
      boss: false,
      attack: null,
      key: `enemy:${enemyId}:${element.id}`,
      sprite,
      palette: element.palette,
      box: packSlot(index, scaled(sprite, SPRITE_SCALE.enemy)),
      pixel: SPRITE_SCALE.enemy,
      motion: new Motion(),
    };
  }
}
