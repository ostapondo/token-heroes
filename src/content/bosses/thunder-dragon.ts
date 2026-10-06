import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'thunder-dragon',
  name: 'Thunder Dragon',
  order: 25,
  creature: CreatureId.Dragon,
  element: ElementId.Storm,
});
