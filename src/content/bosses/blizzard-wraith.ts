import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'blizzard-wraith',
  name: 'Blizzard Wraith',
  order: 23,
  creature: CreatureId.Wraith,
  element: ElementId.Ice,
});
