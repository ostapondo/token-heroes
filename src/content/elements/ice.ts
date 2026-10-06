import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Ice,
  name: 'Ice',
  status: 'FROZEN',
  palette: { a: '#4f9fd1', b: '#2a6f9e', c: '#bfeaff', e: '#f2fbff', h: '#e8f7ff', x: '#0b2233' },
  sky: '#0a1b28',
  floor: '#dff3ff',
  accent: '#8fd8ff',
  weather: [
    { kind: WeatherKind.FrostEdges },
    { kind: WeatherKind.Fog, color: '#dff3ff' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Snow },
  ],
});
