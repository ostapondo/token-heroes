import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'blood-reaper',
  name: 'Blood Reaper',
  order: 29,
  creature: CreatureId.Wraith,
  element: ElementId.Blood,
});
