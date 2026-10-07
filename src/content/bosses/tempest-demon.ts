import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'tempest-demon',
  name: 'Tempest Demon',
  order: 32,
  creature: CreatureId.Demon,
  element: ElementId.Storm,
});
