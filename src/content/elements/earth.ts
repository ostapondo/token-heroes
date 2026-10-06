import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Earth,
  name: 'Earth',
  status: 'CRUSHED',
  palette: { a: '#8a6a3a', b: '#5a4428', c: '#a8b85a', e: '#ffb02e', h: '#c9c3b4', x: '#2a1f12' },
  sky: '#16120c',
  floor: '#3a2c18',
  accent: '#c9a05a',
  weather: [
    { kind: WeatherKind.Fog, color: '#c9a05a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Rocks },
  ],
});
