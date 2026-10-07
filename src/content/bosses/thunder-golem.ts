import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'thunder-golem',
  name: 'Thunder Golem',
  order: 49,
  creature: CreatureId.Golem,
  element: ElementId.Storm,
});
