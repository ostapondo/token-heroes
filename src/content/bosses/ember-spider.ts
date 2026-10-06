import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'ember-spider',
  name: 'Ember Spider',
  order: 22,
  creature: CreatureId.Spider,
  element: ElementId.Fire,
});
