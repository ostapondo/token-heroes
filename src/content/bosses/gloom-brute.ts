import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'gloom-brute',
  name: 'Gloom Brute',
  order: 51,
  creature: CreatureId.Zombie,
  element: ElementId.Shadow,
});
