import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'stone-knight',
  name: 'Stone Knight',
  order: 57,
  creature: CreatureId.Knight,
  element: ElementId.Earth,
});
