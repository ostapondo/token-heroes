import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'night-fiend',
  name: 'Night Fiend',
  order: 18,
  creature: CreatureId.Demon,
  element: ElementId.Shadow,
});
