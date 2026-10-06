import type { Point } from '../scene/geometry';
import { FX_COLOR } from './colors';
import { PIXEL_FONT, TimedEffect } from './effect';

export interface TextStyle {
  readonly color: string;
  readonly size: number;
  readonly life?: number;
  readonly rise?: number;
}

const POP = { peak: 0.15, scale: 1.3 } as const;
const FADE_FROM = 0.7;

export class FloatingText extends TimedEffect {
  readonly #text: string;
  readonly #at: Point;
  readonly #style: TextStyle;

  constructor(text: string, at: Point, style: TextStyle) {
    super(style.life ?? 0.9);
    this.#text = text;
    this.#at = at;
    this.#style = style;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;
    const scale = progress < POP.peak ? 0.5 + (progress / POP.peak) * (POP.scale - 0.5) : 1;
    const alpha = progress < FADE_FROM ? 1 : 1 - (progress - FADE_FROM) / (1 - FADE_FROM);
    const y = this.#at.y - progress * (this.#style.rise ?? 20);

    context.save();
    context.globalAlpha = alpha;
    context.font = `${Math.round(this.#style.size * scale)}px ${PIXEL_FONT}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = FX_COLOR.shadow;
    context.fillText(this.#text, this.#at.x + 1, y + 1);
    context.fillStyle = this.#style.color;
    context.fillText(this.#text, this.#at.x, y);
    context.restore();
  }
}
