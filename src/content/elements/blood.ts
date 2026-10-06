import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'blood',
  name: 'Blood',
  status: 'CURSED',
  palette: { a: '#8e0f1a', b: '#4a060c', c: '#ff7a3d', e: '#ffd23f', h: '#e8d9c0', x: '#120406' },
  sky: '#140305',
  floor: '#2a070a',
  accent: '#e0252f',
  weather: [
    { kind: 'summoning-ring' },
    { kind: 'pulse', color: '#e0252f' },
    { kind: 'particles', preset: 'ash' },
  ],
});
