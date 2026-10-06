import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'glacier-slime',
  name: 'Glacier Slime',
  order: 24,
  creature: CreatureId.Slime,
  element: ElementId.Ice,
});
