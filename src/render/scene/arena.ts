import { elementById, type Content, type ElementDef } from '@content';
import {
  upcomingBoss,
  type BattleEvent,
  type BattleState,
  type PartyState,
  type Roster,
} from '@engine';
import { Director, type Reaction } from '../fx/director';
import type { Effect } from '../fx/effect';
import { runLoop } from '../loop';
import { SpriteCache } from '../sprites/sprite-cache';
import { createWeather, WeatherLayer, type Weather } from '../weather';
import { Cast } from './cast';
import { ARENA, center, floorTop } from './geometry';
import { paintBackdrop, paintCast } from './painter';

export interface ArenaOptions {
  readonly canvas: HTMLCanvasElement;
  readonly content: Content;
  readonly roster: Roster;
  readonly onError: (error: unknown, where: string) => void;
}

const SHAKE_DECAY = 18;
const FOCUS_DEPTH = 22;

export class Arena {
  readonly #options: ArenaOptions;
  readonly #context: CanvasRenderingContext2D;
  readonly #cast: Cast;
  readonly #director: Director;
  #element: ElementDef | undefined;
  #weather: Weather[] = [];
  #effects: Effect[] = [];
  #snapshot: { battle: BattleState; party: PartyState } | undefined;
  #shake = 0;
  #stop: (() => void) | undefined;

  constructor(options: ArenaOptions) {
    const context = options.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable');
    this.#options = options;
    this.#context = context;
    this.#cast = new Cast(options.content, new SpriteCache());
    this.#director = new Director(options.content);
  }

  show(battle: BattleState, party: PartyState): void {
    const elementId = upcomingBoss(this.#options.roster, battle.stage).element;
    if (this.#element?.id !== elementId) {
      this.#element = elementById(this.#options.content, elementId);
      this.#weather = this.#element.weather.flatMap((def) =>
        this.#attempt('weather setup', () => [createWeather(def)], []),
      );
    }
    this.#cast.sync(battle, party, this.#element);
    this.#snapshot = { battle, party };
  }

  play(events: readonly BattleEvent[]): void {
    const element = this.#element;
    if (!element) return;
    const stage = { heroes: this.#cast.heroes, foes: this.#cast.foes, element };
    for (const event of events) {
      this.#apply(this.#attempt('battle event', () => this.#director.react(event, stage), null));
    }
  }

  celebrate(heroId: string, level: number): void {
    const hero = this.#cast.hero(heroId);
    if (hero) this.#apply(this.#director.celebrate(hero, level));
  }

  resize(cssWidth: number, pixelRatio: number): void {
    const scale = (cssWidth / ARENA.width) * pixelRatio;
    const { canvas } = this.#options;
    canvas.width = Math.round(ARENA.width * scale);
    canvas.height = Math.round(ARENA.height * scale);
    this.#context.setTransform(scale, 0, 0, scale, 0, 0);
    this.#context.imageSmoothingEnabled = false;
  }

  start(): void {
    this.#stop ??= runLoop((dt) => this.#attempt('frame', () => this.#frame(dt), undefined));
  }

  stop(): void {
    this.#stop?.();
    this.#stop = undefined;
  }

  #frame(dt: number): void {
    const element = this.#element;
    const snapshot = this.#snapshot;
    if (!element || !snapshot) return;
    const context = this.#context;
    const actors = [...this.#cast.heroes, ...this.#cast.foes];
    const front = this.#cast.foes[0];
    const focus = {
      x: front ? center(front.box).x : ARENA.width * 0.75,
      y: floorTop() + FOCUS_DEPTH,
    };

    for (const actor of actors) actor.motion.update(dt);
    this.#weather = this.#weather.filter((effect) =>
      this.#survives('weather', () => effect.update?.(dt)),
    );
    this.#effects = this.#effects.filter((effect) =>
      this.#attempt('effect', () => effect.update(dt), false),
    );
    this.#shake = Math.max(0, this.#shake - dt * SHAKE_DECAY);

    context.save();
    const jitter = () => Math.round((Math.random() - 0.5) * this.#shake);
    context.translate(jitter(), jitter());
    paintBackdrop(context, element);
    this.#drawWeather(WeatherLayer.Back, { focus });
    paintCast(context, this.#cast.sprites, this.#cast, snapshot.battle);
    this.#drawWeather(WeatherLayer.Front, { focus });
    this.#effects = this.#effects.filter((effect) =>
      this.#survives('effect', () => effect.draw(context)),
    );
    context.restore();
  }

  #drawWeather(layer: Weather['layer'], scene: Parameters<Weather['draw']>[1]): void {
    this.#weather = this.#weather.filter(
      (effect) =>
        effect.layer !== layer ||
        this.#survives('weather', () => effect.draw(this.#context, scene)),
    );
  }

  #apply(reaction: Reaction | null): void {
    if (!reaction) return;
    this.#effects.push(...reaction.effects);
    this.#shake = Math.max(this.#shake, reaction.shake);
  }

  #survives(where: string, work: () => void): boolean {
    return this.#attempt(
      where,
      () => {
        work();
        return true;
      },
      false,
    );
  }

  #attempt<T>(where: string, work: () => T, fallback: T): T {
    try {
      return work();
    } catch (error) {
      this.#options.onError(error, where);
      return fallback;
    }
  }
}
