import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'miser-wraith',
  name: 'Miser Wraith',
  order: 37,
  creature: CreatureId.Wraith,
  element: ElementId.Gold,
});
