import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'blood-knight',
  name: 'Blood Knight',
  order: 69,
  creature: CreatureId.Knight,
  element: ElementId.Blood,
});
