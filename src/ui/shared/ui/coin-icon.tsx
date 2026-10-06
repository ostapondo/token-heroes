import { token } from '@styled/tokens';

const COIN_PATHS = {
  rim: 'M2 0h3v1h-3zM1 1h5v5h-5zM2 6h3v1h-3zM0 2h1v3h-1zM6 2h1v3h-1z',
  slot: 'M3 2h1v3h-1z',
} as const;

export function CoinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
      <path fill={token('colors.coin')} d={COIN_PATHS.rim} />
      <path fill={token('colors.coinShade')} d={COIN_PATHS.slot} />
    </svg>
  );
}
