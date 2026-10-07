import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'shock-slime',
  name: 'Shock Slime',
  order: 72,
  creature: CreatureId.Slime,
  element: ElementId.Storm,
});
