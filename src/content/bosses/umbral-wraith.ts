import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'umbral-wraith',
  name: 'Umbral Wraith',
  order: 67,
  creature: CreatureId.Wraith,
  element: ElementId.Shadow,
});
