import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'pit-lord',
  name: 'Pit Lord',
  order: 10,
  creature: CreatureId.Demon,
  element: ElementId.Fire,
});
