import { assertMatches, extractCapturedGroup } from './testUtils';

describe('assertMatches', () => {
  test('passes when pattern with g flag produces expected matches', () => {
    assertMatches('**bold**', /\*\*/g, ['**', '**']);
  });

  test('adds g flag when pattern does not have it', () => {
    // Pattern without 'g' — the function should still find all occurrences.
    assertMatches('**bold**', /\*\*/, ['**', '**']);
  });

  test('passes when no matches and expectedMatches is empty', () => {
    assertMatches('no markers here', /\*\*/, []);
  });
});

describe('extractCapturedGroup', () => {
  test('returns null when pattern does not match', () => {
    const result = extractCapturedGroup('hello', /\*\*/g, 1);
    expect(result).toBeNull();
  });

  test('returns the captured group value when group index is defined', () => {
    // Pattern captures the word inside brackets as group 1.
    const result = extractCapturedGroup('[hello]', /\[(\w+)\]/g, 1);
    expect(result).toBe('hello');
  });

  test('returns null when pattern matches but specified group index has no capture', () => {
    // Group 1 only captures when the second alternative matches.
    // Here "abc" matches the first alternative (?:abc), so match[1] is undefined.
    const result = extractCapturedGroup('abc', /(?:abc)|(xyz)/g, 1);
    expect(result).toBeNull();
  });

  test('falls through to the next index when earlier index is undefined', () => {
    // Alternation: group 1 captures "left", group 2 captures "right".
    // "right" matches via group 2 so match[1] is undefined, match[2] is "right".
    const result = extractCapturedGroup('right', /(left)|(right)/g, 1, 2);
    expect(result).toBe('right');
  });
});
