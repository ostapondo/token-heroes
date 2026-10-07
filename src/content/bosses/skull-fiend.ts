import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'skull-fiend',
  name: 'Skull Fiend',
  order: 55,
  creature: CreatureId.Demon,
  element: ElementId.Bone,
});
