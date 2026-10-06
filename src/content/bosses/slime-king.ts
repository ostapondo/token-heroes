import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'slime-king',
  name: 'Slime King',
  order: 8,
  creature: CreatureId.Slime,
  element: ElementId.Gold,
});
