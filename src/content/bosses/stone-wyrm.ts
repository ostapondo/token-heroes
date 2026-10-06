import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'stone-wyrm',
  name: 'Stone Wyrm',
  order: 17,
  creature: CreatureId.Dragon,
  element: ElementId.Earth,
});
