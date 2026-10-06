import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'magma-golem',
  name: 'Magma Golem',
  order: 19,
  creature: CreatureId.Golem,
  element: ElementId.Fire,
});
