import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'dust-devil',
  name: 'Dust Devil',
  order: 40,
  creature: CreatureId.Demon,
  element: ElementId.Earth,
});
