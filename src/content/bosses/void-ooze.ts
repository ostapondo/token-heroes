import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'void-ooze',
  name: 'Void Ooze',
  order: 46,
  creature: CreatureId.Slime,
  element: ElementId.Shadow,
});
