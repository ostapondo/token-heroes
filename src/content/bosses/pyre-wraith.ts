import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'pyre-wraith',
  name: 'Pyre Wraith',
  order: 53,
  creature: CreatureId.Wraith,
  element: ElementId.Fire,
});
