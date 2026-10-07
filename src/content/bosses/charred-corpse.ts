import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'charred-corpse',
  name: 'Charred Corpse',
  order: 35,
  creature: CreatureId.Zombie,
  element: ElementId.Fire,
});
