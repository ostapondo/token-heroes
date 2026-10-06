import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'cinder-dragon',
  name: 'Cinder Dragon',
  order: 1,
  creature: CreatureId.Dragon,
  element: ElementId.Fire,
});
