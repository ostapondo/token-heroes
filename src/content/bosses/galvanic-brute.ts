import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'galvanic-brute',
  name: 'Galvanic Brute',
  order: 58,
  creature: CreatureId.Zombie,
  element: ElementId.Storm,
});
