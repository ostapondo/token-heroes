import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'plague-knight',
  name: 'Plague Knight',
  order: 64,
  creature: CreatureId.Knight,
  element: ElementId.Venom,
});
