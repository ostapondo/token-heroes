import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'bile-demon',
  name: 'Bile Demon',
  order: 48,
  creature: CreatureId.Demon,
  element: ElementId.Venom,
});
