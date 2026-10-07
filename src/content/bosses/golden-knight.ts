import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'golden-knight',
  name: 'Golden Knight',
  order: 50,
  creature: CreatureId.Knight,
  element: ElementId.Gold,
});
