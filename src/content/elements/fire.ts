import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'fire',
  name: 'Fire',
  status: 'BURNING',
  palette: { a: '#c2361a', b: '#7a1d0c', c: '#ffb02e', e: '#ffd36a', h: '#e8d9c0', x: '#2a0a04' },
  sky: '#240b05',
  floor: '#e0451a',
  accent: '#ff6a2b',
  weather: [
    { kind: 'glow', color: '#ff5a1f' },
    { kind: 'lava-floor' },
    { kind: 'particles', preset: 'embers' },
  ],
});
