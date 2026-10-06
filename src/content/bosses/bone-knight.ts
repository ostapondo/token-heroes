import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'bone-knight',
  name: 'Bone Knight',
  order: 4,
  creature: CreatureId.Knight,
  element: ElementId.Bone,
});
