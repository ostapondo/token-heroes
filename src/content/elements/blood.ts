import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Blood,
  name: 'Blood',
  status: 'CURSED',
  palette: { a: '#8e0f1a', b: '#4a060c', c: '#ff7a3d', e: '#ffd23f', h: '#e8d9c0', x: '#120406' },
  sky: '#140305',
  floor: '#2a070a',
  accent: '#e0252f',
  weather: [
    { kind: WeatherKind.SummoningRing },
    { kind: WeatherKind.Pulse, color: '#e0252f' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Ash },
  ],
});
