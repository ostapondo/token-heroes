import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'spark-spider',
  name: 'Spark Spider',
  order: 66,
  creature: CreatureId.Spider,
  element: ElementId.Storm,
});
