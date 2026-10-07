import { WeatherKind, type WeatherDef } from '@content';
import { Fog, Glow, Pulse } from './ambience';
import { Particles } from './particles';
import { GhostFlames, Lightning } from './spirits';
import { FrostEdges, SummoningRing } from './terrain';
import type { Weather } from './weather';

function unknownWeather(def: never): never {
  throw new Error(`No weather effect draws ${JSON.stringify(def)}`);
}

export function createWeather(def: WeatherDef): Weather {
  switch (def.kind) {
    case WeatherKind.Particles:
      return new Particles(def.preset);
    case WeatherKind.Glow:
      return new Glow(def.color);
    case WeatherKind.Fog:
      return new Fog(def.color);
    case WeatherKind.Pulse:
      return new Pulse(def.color);
    case WeatherKind.FrostEdges:
      return new FrostEdges();
    case WeatherKind.Lightning:
      return new Lightning();
    case WeatherKind.SummoningRing:
      return new SummoningRing();
    case WeatherKind.GhostFlames:
      return new GhostFlames();
    default:
      return unknownWeather(def);
  }
}

export { WeatherLayer, type Weather } from './weather';
