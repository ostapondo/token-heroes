import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'storm-knight',
  name: 'Storm Knight',
  order: 42,
  creature: CreatureId.Knight,
  element: ElementId.Storm,
});
