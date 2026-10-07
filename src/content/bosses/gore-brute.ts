import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'gore-brute',
  name: 'Gore Brute',
  order: 43,
  creature: CreatureId.Zombie,
  element: ElementId.Blood,
});
