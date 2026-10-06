import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'bone',
  name: 'Bone',
  status: 'HAUNTED',
  palette: { a: '#9aa38f', b: '#5c6457', c: '#e9e2cc', e: '#52e0c4', h: '#e9e2cc', x: '#0c1614' },
  sky: '#071110',
  floor: '#11201d',
  accent: '#52e0c4',
  weather: [{ kind: 'ghost-flames' }, { kind: 'particles', preset: 'wisps' }],
});
