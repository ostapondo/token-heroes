import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'bog-brute',
  name: 'Bog Brute',
  order: 21,
  creature: CreatureId.Zombie,
  element: ElementId.Earth,
});
