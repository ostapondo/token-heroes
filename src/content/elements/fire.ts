import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Fire,
  name: 'Fire',
  status: 'BURNING',
  palette: { a: '#c2361a', b: '#7a1d0c', c: '#ffb02e', e: '#ffd36a', h: '#e8d9c0', x: '#2a0a04' },
  sky: '#240b05',
  floor: '#e0451a',
  accent: '#ff6a2b',
  weather: [
    { kind: WeatherKind.Glow, color: '#ff5a1f' },
    { kind: WeatherKind.LavaFloor },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Embers },
  ],
});
