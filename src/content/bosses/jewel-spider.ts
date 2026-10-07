import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'jewel-spider',
  name: 'Jewel Spider',
  order: 59,
  creature: CreatureId.Spider,
  element: ElementId.Gold,
});
