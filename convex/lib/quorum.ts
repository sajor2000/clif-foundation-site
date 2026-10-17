/** Majority of eligible directors (simple default for v1). */
export function quorumRequired(directorCount: number, fraction = 0.5): number {
  if (directorCount <= 0) return 1;
  return Math.max(1, Math.ceil(directorCount * fraction));
}

export function quorumMet(present: number, required: number): boolean {
  return present >= required;
}
