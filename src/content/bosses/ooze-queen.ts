import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'ooze-queen',
  name: 'Ooze Queen',
  order: 16,
  creature: CreatureId.Slime,
  element: ElementId.Venom,
});
