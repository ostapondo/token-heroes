import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'venom-drake',
  name: 'Venom Drake',
  order: 28,
  creature: CreatureId.Dragon,
  element: ElementId.Venom,
});
