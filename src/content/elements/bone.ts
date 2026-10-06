import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Bone,
  name: 'Bone',
  status: 'HAUNTED',
  palette: { a: '#9aa38f', b: '#5c6457', c: '#e9e2cc', e: '#52e0c4', h: '#e9e2cc', x: '#0c1614' },
  sky: '#071110',
  floor: '#11201d',
  accent: '#52e0c4',
  weather: [
    { kind: WeatherKind.GhostFlames },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Wisps },
  ],
});
