import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'frost-golem',
  name: 'Frost Golem',
  order: 11,
  creature: CreatureId.Golem,
  element: ElementId.Ice,
});
