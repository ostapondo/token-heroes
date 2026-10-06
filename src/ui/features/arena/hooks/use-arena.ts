import { CONTENT } from '@content';
import { Arena } from '@render';
import { useEffect, type RefObject } from 'react';
import { useSession } from '../../../entities/game';

export function useArena(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  const session = useSession();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return undefined;
    const arena = new Arena({
      canvas,
      content: CONTENT,
      roster: session.roster,
      onError: (error, where) => session.reportError(error, `Arena ${where}`),
    });
    const resize = () => arena.resize(canvas.clientWidth, window.devicePixelRatio);
    const observer = new ResizeObserver(resize);

    observer.observe(canvas);
    resize();
    session.attachArena(arena);
    arena.start();

    return () => {
      arena.stop();
      observer.disconnect();
      session.attachArena(null);
    };
  }, [canvasRef, session]);
}
