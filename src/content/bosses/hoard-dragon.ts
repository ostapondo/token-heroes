import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'hoard-dragon',
  name: 'Hoard Dragon',
  order: 39,
  creature: CreatureId.Dragon,
  element: ElementId.Gold,
});
