/**
 * Simple majority of eligible directors: floor(n/2)+1.
 * (ceil(n*0.5) is wrong for even boards — e.g. 4 directors need 3, not 2.)
 */
export function quorumRequired(directorCount: number): number {
  if (directorCount <= 0) return 1;
  return Math.floor(directorCount / 2) + 1;
}

export function quorumMet(present: number, required: number): boolean {
  return present >= required;
}
