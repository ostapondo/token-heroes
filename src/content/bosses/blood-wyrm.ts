import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'blood-wyrm',
  name: 'Blood Wyrm',
  order: 47,
  creature: CreatureId.Dragon,
  element: ElementId.Blood,
});
