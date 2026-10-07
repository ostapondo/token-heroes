import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'mammon',
  name: 'Mammon',
  order: 62,
  creature: CreatureId.Demon,
  element: ElementId.Gold,
});
