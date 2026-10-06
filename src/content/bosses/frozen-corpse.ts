import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'frozen-corpse',
  name: 'Frozen Corpse',
  order: 13,
  creature: CreatureId.Zombie,
  element: ElementId.Ice,
});
