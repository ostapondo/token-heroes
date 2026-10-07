import { defineBoss } from '../model/definitions';
import { CreatureId, ElementId } from '../model/ids';

export default defineBoss({
  id: 'obsidian-golem',
  name: 'Obsidian Golem',
  order: 56,
  creature: CreatureId.Golem,
  element: ElementId.Shadow,
});
