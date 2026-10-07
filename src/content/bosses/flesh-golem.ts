import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'flesh-golem',
  name: 'Flesh Golem',
  order: 63,
  creature: CreatureId.Golem,
  element: ElementId.Blood,
});
