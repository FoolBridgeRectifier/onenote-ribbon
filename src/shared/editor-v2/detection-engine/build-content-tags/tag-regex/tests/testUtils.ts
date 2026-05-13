/** Asserts that applying `pattern` to `content` produces exactly `expectedMatches` (all occurrences). */
export const assertMatches = (
  content: string,
  pattern: RegExp,
  expectedMatches: string[]
): void => {
  const globalFlags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const globalPattern = new RegExp(pattern.source, globalFlags);
  const actualMatches = Array.from(content.matchAll(globalPattern), (match) => match[0]);
  expect(actualMatches).toEqual(expectedMatches);
};

/**
 * Returns the value of the first non-undefined capture group from `groupIndices`
 * in the first match of `pattern` against `content`.
 * Accepts multiple indices to handle alternation regexes where the id may land in different groups.
 */
export const extractCapturedGroup = (
  content: string,
  pattern: RegExp,
  ...groupIndices: number[]
): string | null => {
  const match = Array.from(content.matchAll(pattern))[0];
  if (!match) return null;

  for (const index of groupIndices) {
    if (match[index] !== undefined) return match[index];
  }

  return null;
};
