import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'eclipse-dragon',
  name: 'Eclipse Dragon',
  order: 31,
  creature: CreatureId.Dragon,
  element: ElementId.Shadow,
});
