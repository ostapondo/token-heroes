import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'plague-brute',
  name: 'Plague Brute',
  order: 5,
  creature: CreatureId.Zombie,
  element: ElementId.Venom,
});
