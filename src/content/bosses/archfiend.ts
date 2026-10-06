import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'archfiend',
  name: 'Archfiend',
  order: 2,
  creature: CreatureId.Demon,
  element: ElementId.Blood,
});
