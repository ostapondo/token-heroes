import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'crypt-spider',
  name: 'Crypt Spider',
  order: 52,
  creature: CreatureId.Spider,
  element: ElementId.Bone,
});
