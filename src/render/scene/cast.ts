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
import { CAMERAS, CameraId, PULLBACK, pulledBack, type Camera } from './camera';
import type { Box, Point } from './geometry';
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

export interface Pullback {
  readonly heroes: readonly Actor[];
  readonly foes: readonly Actor[];
  readonly ratio: number;
}

interface Arrival {
  readonly ratio: number;
  readonly wait: number;
}

const NOWHERE: Box = { x: 0, y: 0, width: 0, height: 0 };
const ENTRY_GAP = 4;

const scaled = (sprite: SpriteDef, scale: number) => {
  const { width, height } = spriteSize(sprite);

  return { width: width * scale, height: height * scale };
};

// A newcomer walks in from the left edge; anyone else walks from where they stood, shrunk with
// the scene when the camera pulled back.
function walkFrom(box: Box, previous: Box | undefined, ratio: number): Point {
  if (!previous) return { x: -(box.x + box.width + ENTRY_GAP), y: 0 };
  const start = pulledBack({ x: previous.x, y: previous.y + previous.height }, ratio);

  return { x: start.x - box.x, y: start.y - (box.y + box.height) };
}

export class Cast {
  readonly #content: Content;
  readonly #sprites: SpriteCache;
  #heroes: Actor[] = [];
  #foes: Actor[] = [];
  #heroKey = '';
  #foeKey = '';
  #camera: Camera = CAMERAS[CameraId.Close];
  #pullback: Pullback | undefined;

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

  takePullback(): Pullback | undefined {
    const pullback = this.#pullback;

    this.#pullback = undefined;

    return pullback;
  }

  sync(battle: BattleState, party: PartyState, element: ElementDef): void {
    const heroKey = party.heroes.map((slot) => slot.heroId).join('|');

    if (heroKey !== this.#heroKey) {
      const joining = this.#heroKey !== '';

      this.#heroKey = heroKey;
      this.#placeHeroes(party, joining);
    }
    const foeKey = [
      this.#camera.id,
      battle.stage,
      element.id,
      ...battle.foes.map((foe) => foe.id),
    ].join('|');

    if (foeKey !== this.#foeKey) {
      this.#foeKey = foeKey;
      this.#foes = battle.foes.map((foe, index) =>
        foe.boss ? this.#bossActor(foe.id, element) : this.#enemyActor(foe.id, index, element),
      );
    }
  }

  #placeHeroes(party: PartyState, joining: boolean): void {
    const heroes = party.heroes.map((slot) => heroDefById(this.#content, slot.heroId));
    const formation = partyFormation(
      heroes.map((hero) => ({
        role: hero.role,
        attack: hero.attack,
        sprite: spriteSize(hero.sprite),
      })),
    );
    const ratio = formation.camera.scale.hero / this.#camera.scale.hero;
    const pulling = joining && formation.camera.id !== this.#camera.id;

    if (pulling) {
      const still = (actor: Actor): Actor => ({ ...actor, motion: new Motion() });

      this.#pullback = { heroes: this.#heroes.map(still), foes: this.#foes, ratio };
    }
    this.#camera = formation.camera;
    const arrival = joining ? { ratio, wait: pulling ? PULLBACK.seconds : 0 } : undefined;

    this.#heroes = heroes.map((hero, index) =>
      this.#heroActor(hero.id, formation.boxes[index] ?? NOWHERE, arrival),
    );
  }

  #heroActor(heroId: string, box: Box, arrival: Arrival | undefined): Actor {
    const sprite = heroDefById(this.#content, heroId).sprite;
    const previous = this.hero(heroId);
    const motion = previous?.motion ?? new Motion();

    if (arrival) motion.walk(walkFrom(box, previous?.box, arrival.ratio), arrival.wait);

    return {
      id: heroId,
      boss: false,
      attack: null,
      key: `hero:${heroId}`,
      sprite,
      palette: undefined,
      box,
      pixel: this.#camera.scale.hero,
      motion,
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
      box: bossSlot(scaled(sprite, this.#camera.scale.boss)),
      pixel: this.#camera.scale.boss,
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
      box: packSlot(index, scaled(sprite, this.#camera.scale.enemy), this.#camera),
      pixel: this.#camera.scale.enemy,
      motion: new Motion(),
    };
  }
}
