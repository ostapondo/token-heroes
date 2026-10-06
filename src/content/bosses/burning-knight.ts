import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'burning-knight',
  name: 'Burning Knight',
  order: 12,
  creature: CreatureId.Knight,
  element: ElementId.Fire,
});
