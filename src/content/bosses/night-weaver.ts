import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'night-weaver',
  name: 'Night Weaver',
  order: 14,
  creature: CreatureId.Spider,
  element: ElementId.Shadow,
});
