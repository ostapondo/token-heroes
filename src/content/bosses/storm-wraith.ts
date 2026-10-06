import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'storm-wraith',
  name: 'Storm Wraith',
  order: 7,
  creature: CreatureId.Wraith,
  element: ElementId.Storm,
});
