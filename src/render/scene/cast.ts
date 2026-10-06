import {
  bossById,
  creatureById,
  enemyById,
  heroDefById,
  type Content,
  type ElementDef,
  type Palette,
  type SpriteDef,
} from '@content';
import type { BattleState, PartyState } from '@engine';
import { spriteSize } from '../sprites/pixels';
import type { SpriteCache } from '../sprites/sprite-cache';
import { SPRITE_SCALE, type Box } from './geometry';
import { bossSlot, packSlot, partySlot } from './layout';
import { Motion } from './motion';

export interface Actor {
  readonly id: string;
  readonly key: string;
  readonly sprite: SpriteDef;
  readonly palette: Palette | undefined;
  readonly box: Box;
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
      this.#heroes = party.heroes.map((slot, index) => this.#heroActor(slot.heroId, index));
    }
    const foeKey = [battle.stage, element.id, ...battle.foes.map((foe) => foe.id)].join('|');

    if (foeKey !== this.#foeKey) {
      this.#foeKey = foeKey;
      this.#foes = battle.foes.map((foe, index) =>
        foe.boss ? this.#bossActor(foe.id, element) : this.#enemyActor(foe.id, index, element),
      );
    }
  }

  #heroActor(heroId: string, index: number): Actor {
    const sprite = heroDefById(this.#content, heroId).sprite;

    return {
      id: heroId,
      key: `hero:${heroId}`,
      sprite,
      palette: undefined,
      box: partySlot(index, scaled(sprite, SPRITE_SCALE.hero)),
      motion: this.hero(heroId)?.motion ?? new Motion(),
    };
  }

  #bossActor(bossId: string, element: ElementDef): Actor {
    const boss = bossById(this.#content, bossId);
    const sprite = creatureById(this.#content, boss.creature).sprite;

    return {
      id: bossId,
      key: `boss:${boss.creature}:${element.id}`,
      sprite,
      palette: element.palette,
      box: bossSlot(scaled(sprite, SPRITE_SCALE.boss)),
      motion: new Motion(),
    };
  }

  #enemyActor(enemyId: string, index: number, element: ElementDef): Actor {
    const sprite = enemyById(this.#content, enemyId).sprite;

    return {
      id: enemyId,
      key: `enemy:${enemyId}:${element.id}`,
      sprite,
      palette: element.palette,
      box: packSlot(index, scaled(sprite, SPRITE_SCALE.enemy)),
      motion: new Motion(),
    };
  }
}
