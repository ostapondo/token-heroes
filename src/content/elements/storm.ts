import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Storm,
  name: 'Storm',
  status: 'SHOCKED',
  palette: { a: '#2f4c6e', b: '#1b2d44', c: '#c9d6e3', e: '#ffe94a', h: '#e9eef5', x: '#0c1220' },
  sky: '#0b111d',
  floor: '#182436',
  accent: '#ffe94a',
  weather: [
    { kind: WeatherKind.Lightning },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Rain },
  ],
});
