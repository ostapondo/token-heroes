import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'gold',
  name: 'Gold',
  status: 'GILDED',
  palette: { a: '#e8a23a', b: '#a8661a', c: '#fff3c4', e: '#ffffff', h: '#dfe3e8', x: '#1a1206' },
  sky: '#1a1406',
  floor: '#2c220c',
  accent: '#ffd36a',
  weather: [
    { kind: 'glow', color: '#ffd36a' },
    { kind: 'particles', preset: 'coins' },
  ],
});
