import { bayer, relativeLuminance, rgb } from './tone';

// A 1:1 pixel buffer. Every shape is spans and single pixels, so nothing anti-aliases.
export class Pixels {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray<ArrayBuffer>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  set(x: number, y: number, hex: string, alpha = 1): void {
    const px = Math.round(x);
    const py = Math.round(y);

    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
    const at = (py * this.width + px) * 4;
    const [r, g, b] = rgb(hex);
    const keep = 1 - alpha;

    this.data[at] = r * alpha + (this.data[at] ?? 0) * keep;
    this.data[at + 1] = g * alpha + (this.data[at + 1] ?? 0) * keep;
    this.data[at + 2] = b * alpha + (this.data[at + 2] ?? 0) * keep;
    this.data[at + 3] = 255;
  }

  // Dithered transparency: the pixel is painted where the Bayer threshold falls under the share.
  stipple(x: number, y: number, hex: string, share: number): void {
    if (share > bayer(Math.round(x), Math.round(y))) this.set(x, y, hex);
  }

  span(x0: number, x1: number, y: number, hex: string, alpha = 1): void {
    for (let x = Math.round(x0); x <= Math.round(x1); x += 1) this.set(x, y, hex, alpha);
  }

  rect(x: number, y: number, width: number, height: number, hex: string): void {
    for (let row = 0; row < height; row += 1) this.span(x, x + width - 1, y + row, hex);
  }

  column(x: number, top: number, bottom: number, hex: string): void {
    for (let y = Math.round(top); y <= Math.round(bottom); y += 1) this.set(x, y, hex);
  }

  disc(cx: number, cy: number, radius: number, hex: string): void {
    for (let dy = -radius; dy <= radius; dy += 1) {
      const half = Math.floor(Math.sqrt(radius * radius - dy * dy + radius * 0.8));

      this.span(cx - half, cx + half, cy + dy, hex);
    }
  }

  // A dithered halo between two radii, fading outwards.
  halo(cx: number, cy: number, inner: number, outer: number, hex: string, strength: number): void {
    for (let y = cy - outer; y <= cy + outer; y += 1) {
      for (let x = cx - outer; x <= cx + outer; x += 1) {
        const distance = Math.hypot(x - cx, y - cy);

        if (distance >= inner && distance <= outer) {
          this.stipple(x, y, hex, (1 - (distance - inner) / (outer - inner)) * strength);
        }
      }
    }
  }

  ring(cx: number, cy: number, radius: number, hex: string, from = 0, to = Math.PI * 2): void {
    const steps = Math.ceil(radius * 8);

    for (let step = 0; step <= steps; step += 1) {
      const angle = from + ((to - from) * step) / steps;

      this.set(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, hex);
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, hex: string, alpha = 1): void {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);

    for (let step = 0; step <= steps; step += 1) {
      this.set(x0 + ((x1 - x0) * step) / steps, y0 + ((y1 - y0) * step) / steps, hex, alpha);
    }
  }

  // Fills each column from its height down to the base: how every silhouette is drawn.
  skyline(heights: readonly number[], base: number, hex: string, rim?: string): void {
    heights.forEach((height, x) => {
      if (height <= 0) return;
      this.column(x, base - height, base, hex);
      if (rim) this.set(x, base - height, rim);
    });
  }

  luminanceAt(x: number, y: number): number {
    const at = (Math.round(y) * this.width + Math.round(x)) * 4;

    return relativeLuminance(this.data[at] ?? 0, this.data[at + 1] ?? 0, this.data[at + 2] ?? 0);
  }

  toCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');

    canvas.width = this.width;
    canvas.height = this.height;
    canvas.getContext('2d')?.putImageData(new ImageData(this.data, this.width), 0, 0);

    return canvas;
  }
}
