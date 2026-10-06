export function lastResort(message: string, ...details: readonly unknown[]): void {
  console.error(`[token-heroes] ${message}`, ...details);
}
