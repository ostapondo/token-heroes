import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'earth-golem',
  name: 'Earth Golem',
  order: 3,
  creature: CreatureId.Golem,
  element: ElementId.Earth,
});
