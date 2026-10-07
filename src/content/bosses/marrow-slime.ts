import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'marrow-slime',
  name: 'Marrow Slime',
  order: 68,
  creature: CreatureId.Slime,
  element: ElementId.Bone,
});
