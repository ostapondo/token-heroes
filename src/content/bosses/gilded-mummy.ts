import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'gilded-mummy',
  name: 'Gilded Mummy',
  order: 70,
  creature: CreatureId.Zombie,
  element: ElementId.Gold,
});
