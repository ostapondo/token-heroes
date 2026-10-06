import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'gilded-colossus',
  name: 'Gilded Colossus',
  order: 27,
  creature: CreatureId.Golem,
  element: ElementId.Gold,
});
