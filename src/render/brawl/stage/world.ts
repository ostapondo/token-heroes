import type { Content, DeathKind, ElementDef } from '@content';
import type { BattleState, Foe, PartyState, Roster } from '@engine';
import type { Point } from '../../geometry';
import type { Body } from './body';
import { Cast } from './cast';
import type { Frame } from './field';
import { Fx } from './fx';
import { Juice } from './juice';
import { Later } from './later';
import { Props } from './props';
import { Shots } from './shots';
import { Vfx } from './vfx';

export interface Wipe {
  readonly death: DeathKind;
  readonly accent: string;
  t: number;
}

export interface Grab {
  readonly body: Body;
  readonly index: number;
  readonly from: Point;
  readonly at: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Everything the director and the choreography share: the bodies, what flies between them, and
// the rules' latest word on the fight.
export class World {
  readonly content: Content;
  readonly roster: Roster;
  readonly cast: Cast;
  readonly fx = new Fx();
  readonly vfx = new Vfx();
  readonly shots = new Shots();
  readonly props = new Props();
  readonly juice = new Juice();
  readonly later = new Later();
  readonly frame: Frame = { left: 0, zoom: 1, time: 0 };
  element: ElementDef | undefined;
  battle: BattleState | undefined;
  // The battle before the latest step, for how much a killing blow outdid what was left.
  previous: BattleState | undefined;
  party: PartyState | undefined;
  wipe: Wipe | null = null;
  grab: Grab | null = null;
  selected: string | null = null;
  // A super boss's throttle holds the party still for this long.
  freeze = 0;

  constructor(content: Content, roster: Roster) {
    this.content = content;
    this.roster = roster;
    this.cast = new Cast(content);
  }

  get now(): number {
    return this.later.now;
  }

  get accent(): string {
    return this.element?.accent ?? '#ff7a2b';
  }

  ruleFoe(index: number): Foe | undefined {
    return this.battle?.foes[index];
  }

  get frontIndex(): number {
    return this.battle?.foes.findIndex((foe) => foe.hp > 0) ?? -1;
  }

  heroUp(id: string): boolean {
    return (this.battle?.vitals[id]?.hp ?? 1) > 0;
  }
}

// The joint a body is struck at, shot from and labelled over.
export const top = (body: Body): Point => body.at(body.anchors.top);
export const hand = (body: Body): Point => body.at(body.anchors.hand);
export const head = (body: Body): Point => body.headPoint;
