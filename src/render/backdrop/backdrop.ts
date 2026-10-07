import type { ElementDef } from '@content';
import type { Animation } from './plane';
import { paintScenery } from './scenery';

interface View {
  readonly bitmap: HTMLCanvasElement;
  readonly animations: readonly Animation[];
}

// Each element's backdrop is painted once; a frame is one bitmap and a few moving pixels.
export class Backdrop {
  readonly #views = new Map<string, View>();

  paint(context: CanvasRenderingContext2D, element: ElementDef, time: number): void {
    const view = this.#view(element);

    context.drawImage(view.bitmap, 0, 0);
    for (const animate of view.animations) animate(context, time);
  }

  #view(element: ElementDef): View {
    const cached = this.#views.get(element.id);

    if (cached) return cached;
    const painted = paintScenery(element.backdrop);
    const view = { bitmap: painted.pixels.toCanvas(), animations: painted.animations };

    this.#views.set(element.id, view);

    return view;
  }
}
