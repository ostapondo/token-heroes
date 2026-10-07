import { withAlpha } from '../../color';
import { ARENA, type Point } from '../../scene/geometry';
import { FX_COLOR } from '../colors';
import { PIXEL_FONT, TimedEffect } from '../effect';
import { fadeAfter } from './pixels';

export interface SkillTextStyle {
  readonly color: string;
  readonly size: number;
  readonly label?: string;
}

const OUTLINE = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [0, 2],
] as const;

// A skill's number punches in larger than a hit, under the skill's name.
export class SkillText extends TimedEffect {
  readonly #text: string;
  readonly #at: Point;
  readonly #style: SkillTextStyle;

  constructor(text: string, at: Point, style: SkillTextStyle) {
    super(1.1);
    this.#text = text;
    this.#at = at;
    this.#style = style;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;
    const scale =
      progress < 0.08 ? 0.6 + progress / 0.08 : progress < 0.18 ? 1.6 - (progress - 0.08) * 6 : 1;
    const y = this.#at.y - progress * 14;
    const { color, size, label } = this.#style;

    context.save();
    context.globalAlpha = fadeAfter(progress, 0.72);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    if (label) {
      context.font = `8px ${PIXEL_FONT}`;
      context.fillStyle = FX_COLOR.shadow;
      context.fillText(label, this.#at.x + 1, y - size * 0.75 + 1);
      context.fillStyle = color;
      context.fillText(label, this.#at.x, y - size * 0.75);
    }
    context.font = `${Math.round(size * scale)}px ${PIXEL_FONT}`;
    context.fillStyle = FX_COLOR.shadow;
    for (const [dx, dy] of OUTLINE) context.fillText(this.#text, this.#at.x + dx, y + dy);
    context.fillStyle = color;
    context.fillText(this.#text, this.#at.x, y);
    context.restore();
  }
}

const BANNER = { y: ARENA.height * 0.3, slide: 60 } as const;

// A band across the arena that names a skill's new rank as it arrives.
export class SkillBanner extends TimedEffect {
  readonly #title: string;
  readonly #note: string;
  readonly #color: string;

  constructor(title: string, note: string, color: string) {
    super(1.8);
    this.#title = title;
    this.#note = note;
    this.#color = color;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;
    const slide = progress < 0.12 ? (1 - progress / 0.12) * BANNER.slide : 0;
    const middle = ARENA.width / 2;

    context.save();
    context.globalAlpha = fadeAfter(progress, 0.75);
    context.fillStyle = withAlpha(FX_COLOR.shadow, 0.55);
    context.fillRect(0, BANNER.y - 16, ARENA.width, 30);
    context.fillStyle = this.#color;
    context.fillRect(0, BANNER.y - 16, ARENA.width, 1);
    context.fillRect(0, BANNER.y + 13, ARENA.width, 1);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `22px ${PIXEL_FONT}`;
    context.fillStyle = FX_COLOR.shadow;
    context.fillText(this.#title, middle + 1 - slide, BANNER.y - 3);
    context.fillStyle = this.#color;
    context.fillText(this.#title, middle - slide, BANNER.y - 4);
    context.font = `9px ${PIXEL_FONT}`;
    context.fillStyle = FX_COLOR.steel;
    context.fillText(this.#note, middle + slide, BANNER.y + 8);
    context.restore();
  }
}
