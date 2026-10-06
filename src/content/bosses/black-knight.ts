import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'black-knight',
  name: 'Black Knight',
  order: 20,
  creature: CreatureId.Knight,
  element: ElementId.Shadow,
});
