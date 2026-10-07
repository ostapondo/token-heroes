import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'mud-slime',
  name: 'Mud Slime',
  order: 54,
  creature: CreatureId.Slime,
  element: ElementId.Earth,
});
