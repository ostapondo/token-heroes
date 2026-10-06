import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'grave-wraith',
  name: 'Grave Wraith',
  order: 15,
  creature: CreatureId.Wraith,
  element: ElementId.Bone,
});
