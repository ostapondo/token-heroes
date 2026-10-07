import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'crimson-widow',
  name: 'Crimson Widow',
  order: 71,
  creature: CreatureId.Spider,
  element: ElementId.Blood,
});
