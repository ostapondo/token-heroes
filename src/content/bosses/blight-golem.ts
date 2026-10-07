import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'blight-golem',
  name: 'Blight Golem',
  order: 33,
  creature: CreatureId.Golem,
  element: ElementId.Venom,
});
