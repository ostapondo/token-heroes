const MAX_FRAME_SECONDS = 0.1;

export function runLoop(frame: (dt: number) => void): () => void {
  let handle = 0;
  let last = performance.now();

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);

    last = now;
    frame(dt);
    handle = requestAnimationFrame(tick);
  };

  handle = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(handle);
}
