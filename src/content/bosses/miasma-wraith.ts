import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'miasma-wraith',
  name: 'Miasma Wraith',
  order: 45,
  creature: CreatureId.Wraith,
  element: ElementId.Venom,
});
