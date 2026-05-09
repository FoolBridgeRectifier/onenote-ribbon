/** Extracts matches of `pattern` from `content`. Collects all when `allMatches` is true, otherwise only the first. */
const extractMatches = (content: string, pattern: RegExp, allMatches: boolean): string[] => {
  if (allMatches) {
    const globalFlags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const globalPattern = new RegExp(pattern.source, globalFlags);
    return Array.from(content.matchAll(globalPattern), (match) => match[0]);
  }
  const firstMatch = content.match(pattern)?.[0] ?? null;
  return firstMatch === null ? [] : [firstMatch];
};

/** Asserts that applying `pattern` to `content` produces exactly `expectedMatches`. */
export const assertMatches = (
  content: string,
  pattern: RegExp,
  expectedMatches: string[],
  allMatches = false
): void => {
  const actualMatches = extractMatches(content, pattern, allMatches);
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
