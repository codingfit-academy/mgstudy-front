export function normalize(text: string): string {
  return text.replace(/[\s.,!?~'"`]/g, "");
}

/** 1 = identical, 0 = nothing in common (character-level edit distance). */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return 1 - prev[b.length] / longest;
}

// Speech recognition mishears children (and homophones, numbers, particles)
// often enough that an exact match would mark correct readings wrong.
export const PASS_SIMILARITY = 0.85;

export function isCloseEnough(heard: string, target: string): boolean {
  return similarity(normalize(heard), normalize(target)) >= PASS_SIMILARITY;
}

/** Words of the target that don't appear in what was heard. */
export function missedWords(target: string, heard: string): string[] {
  const heardNorm = normalize(heard);
  return target
    .split(/\s+/)
    .filter((w) => normalize(w) !== "" && !heardNorm.includes(normalize(w)));
}
