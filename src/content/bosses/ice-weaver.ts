import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'ice-weaver',
  name: 'Ice Weaver',
  order: 44,
  creature: CreatureId.Spider,
  element: ElementId.Ice,
});
