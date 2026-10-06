import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Venom,
  name: 'Venom',
  status: 'POISONED',
  palette: { a: '#5b8a24', b: '#33521a', c: '#c7d94a', e: '#e2e86a', h: '#e9e2cc', x: '#142008' },
  sky: '#0b1006',
  floor: '#18200d',
  accent: '#a6d83d',
  weather: [
    { kind: WeatherKind.Fog, color: '#a6d83d' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Drips },
  ],
});
