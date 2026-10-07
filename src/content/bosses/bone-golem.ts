import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'bone-golem',
  name: 'Bone Golem',
  order: 41,
  creature: CreatureId.Golem,
  element: ElementId.Bone,
});
