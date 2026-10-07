import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'lava-slime',
  name: 'Lava Slime',
  order: 61,
  creature: CreatureId.Slime,
  element: ElementId.Fire,
});
