import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Gold,
  name: 'Gold',
  status: 'GILDED',
  palette: { a: '#e8a23a', b: '#a8661a', c: '#fff3c4', e: '#ffffff', h: '#dfe3e8', x: '#1a1206' },
  sky: '#1a1406',
  floor: '#2c220c',
  accent: '#ffd36a',
  weather: [
    { kind: WeatherKind.Glow, color: '#ffd36a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Coins },
  ],
});
