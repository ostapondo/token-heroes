import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'frost-knight',
  name: 'Frost Knight',
  order: 34,
  creature: CreatureId.Knight,
  element: ElementId.Ice,
});
