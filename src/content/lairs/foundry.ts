import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { LitterShape, SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Foundry,
  name: 'Foundry',
  status: 'CLIPPED',
  palette: { a: '#8a929c', b: '#5a626c', c: '#e0e6ec', e: '#ff9a2a', h: '#ffd24a', x: '#1a1e24' },
  accent: '#ff9a2a',
  backdrop: {
    seed: 83,
    sky: ['#0c0604', '#1e0e06', '#3a1a0a', '#5a2a10', '#7a3c14'],
    ground: ['#5a4a40', '#4a3c34', '#3c302a', '#2e2420'],
    scenery: [
      { kind: SceneryKind.Clouds, top: 20, thick: 8, body: '#2a1408', lit: '#5a2a10' },
      {
        kind: SceneryKind.Orb,
        halos: [[14, 30, '#4a2008', 1]],
        discs: [
          [13, '#ff9a2a', 0, 0],
          [11, '#ffd24a', -1, -1],
        ],
      },
      {
        kind: SceneryKind.Mesas,
        mesas: [
          [-10, 30, 30],
          [40, 80, 22],
          [150, 200, 34],
        ],
        color: '#1a120e',
        rim: '#5a3a20',
        strata: '#24180f',
      },
      {
        kind: SceneryKind.Hoard,
        mounds: [
          [4, 24, 12],
          [56, 18, 8],
          [104, 26, 10],
          [156, 30, 14],
          [188, 22, 9],
        ],
        color: '#5a626c',
        rim: '#b8c0c8',
        glint: '#f0f4f8',
        sparkle: '#ffffff',
      },
      {
        kind: SceneryKind.Cracks,
        count: 8,
        color: '#c2561a',
        glow: '#5a2a10',
        hot: '#ffd24a',
        warm: '#ff9a2a',
        bubble: '#ffe0a0',
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Sparkle,
        count: 24,
        minDepth: 0.15,
        colors: ['#e0e6ec', '#b8c0c8'],
      },
    ],
  },
  death: DeathKind.Clip,
  weather: [
    { kind: WeatherKind.Glow, color: '#ff9a2a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Ash },
  ],
});
