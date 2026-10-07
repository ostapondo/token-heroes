import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'bone-ghoul',
  name: 'Bone Ghoul',
  order: 65,
  creature: CreatureId.Zombie,
  element: ElementId.Bone,
});
