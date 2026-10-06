import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'rime-dragon',
  name: 'Rime Dragon',
  order: 9,
  creature: CreatureId.Dragon,
  element: ElementId.Ice,
});
