import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'bone-dragon',
  name: 'Bone Dragon',
  order: 30,
  creature: CreatureId.Dragon,
  element: ElementId.Bone,
});
