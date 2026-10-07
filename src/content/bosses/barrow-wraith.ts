import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'barrow-wraith',
  name: 'Barrow Wraith',
  order: 60,
  creature: CreatureId.Wraith,
  element: ElementId.Earth,
});
