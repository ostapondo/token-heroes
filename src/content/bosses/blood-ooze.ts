import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'blood-ooze',
  name: 'Blood Ooze',
  order: 38,
  creature: CreatureId.Slime,
  element: ElementId.Blood,
});
