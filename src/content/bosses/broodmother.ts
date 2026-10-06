import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'broodmother',
  name: 'Broodmother',
  order: 6,
  creature: CreatureId.Spider,
  element: ElementId.Venom,
});
