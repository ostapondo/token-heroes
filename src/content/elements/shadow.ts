import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Shadow,
  name: 'Shadow',
  status: 'BLINDED',
  palette: { a: '#2c303a', b: '#16181d', c: '#5a6070', e: '#f2f2f2', h: '#8a90a0', x: '#000000' },
  sky: '#050608',
  floor: '#0e1014',
  accent: '#d8dde6',
  weather: [
    { kind: WeatherKind.Pulse, color: '#000000' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Motes },
  ],
});
