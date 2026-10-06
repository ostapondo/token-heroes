import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'frost-devil',
  name: 'Frost Devil',
  order: 26,
  creature: CreatureId.Demon,
  element: ElementId.Ice,
});
