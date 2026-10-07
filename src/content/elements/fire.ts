import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Fire,
  name: 'Fire',
  status: 'BURNING',
  palette: { a: '#c2361a', b: '#7a1d0c', c: '#ffb02e', e: '#ffd36a', h: '#e8d9c0', x: '#2a0a04' },
  accent: '#ff6a2b',
  backdrop: {
    seed: 11,
    sky: ['#140403', '#210704', '#350b05', '#561307', '#8a260b'],
    ground: ['#6e220d', '#5a1c0a', '#48160a', '#361107'],
    scenery: [
      { kind: SceneryKind.Clouds, top: 18, thick: 7, body: '#260805', lit: '#4a1206' },
      { kind: SceneryKind.Clouds, top: 38, thick: 6, body: '#2c0905', lit: '#5e1608' },
      { kind: SceneryKind.Ridge, base: 12, amplitude: 10, roughness: 0.55, color: '#5a1a0a' },
      { kind: SceneryKind.Peaks, peaks: [[170, 30, 1.2]], color: '#2c0a05', rim: '#5e1608' },
      {
        kind: SceneryKind.Volcano,
        peak: [54, 50, 1.3],
        color: '#2c0a05',
        rim: '#5e1608',
        glow: '#7a1d0c',
        crater: ['#ffb02e', '#e0451a'],
        lava: ['#ff6a2b', '#c2361a'],
      },
      {
        kind: SceneryKind.Ridge,
        base: 4,
        amplitude: 7,
        roughness: 0.7,
        color: '#180503',
        glow: '#ff6a2b',
      },
      {
        kind: SceneryKind.Cracks,
        count: 11,
        color: '#c2361a',
        glow: '#6a1c0a',
        hot: '#ffb02e',
        warm: '#e0451a',
        bubble: '#ffd36a',
      },
    ],
  },
  death: DeathKind.Ash,
  weather: [
    { kind: WeatherKind.Glow, color: '#ff5a1f' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Embers },
  ],
});
