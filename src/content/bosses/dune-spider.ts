import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'dune-spider',
  name: 'Dune Spider',
  order: 36,
  creature: CreatureId.Spider,
  element: ElementId.Earth,
});
