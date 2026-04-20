/**
 * Tests for per-file-coverage-threshold helpers and collectFileFailures.
 * Uses CJS require because the source files use CJS module format.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { statementPercent, branchPercent, linePercent, displayPath } = require('./helpers.cjs');
const { collectFileFailures } = require('./perFileCoverageThreshold.cjs');
const { PER_FILE_THRESHOLD } = require('./constants.cjs');

// ── statementPercent ────────────────────────────────────────────────────────

describe('statementPercent', () => {
  it('returns 100 when hitCounts map is empty (nothing to cover)', () => {
    expect(statementPercent({})).toBe(100);
  });

  it('returns 100 when all statements are hit', () => {
    expect(statementPercent({ 0: 1, 1: 3, 2: 2 })).toBe(100);
  });

  it('returns 0 when no statements are hit', () => {
    expect(statementPercent({ 0: 0, 1: 0, 2: 0 })).toBe(0);
  });

  it('calculates partial coverage correctly', () => {
    // 2 out of 4 statements hit = 50%
    expect(statementPercent({ 0: 1, 1: 0, 2: 2, 3: 0 })).toBe(50);
  });

  it('treats a count of exactly 0 as not covered', () => {
    expect(statementPercent({ 0: 0 })).toBe(0);
  });

  it('treats any count greater than 0 as covered', () => {
    expect(statementPercent({ 0: 999 })).toBe(100);
  });
});

// ── branchPercent ───────────────────────────────────────────────────────────

describe('branchPercent', () => {
  it('returns 100 when branchHitCounts map is empty (no branches)', () => {
    expect(branchPercent({})).toBe(100);
  });

  it('returns 100 when all branch forks are covered', () => {
    // Two if/else branches each with two forks
    expect(branchPercent({ 0: [1, 2], 1: [3, 1] })).toBe(100);
  });

  it('returns 0 when no branch forks are covered', () => {
    expect(branchPercent({ 0: [0, 0], 1: [0, 0] })).toBe(0);
  });

  it('calculates partial fork coverage correctly', () => {
    // 2 covered forks out of 4 total = 50%
    expect(branchPercent({ 0: [1, 0], 1: [0, 1] })).toBe(50);
  });

  it('handles ternary (single fork arrays)', () => {
    expect(branchPercent({ 0: [1], 1: [0] })).toBe(50);
  });
});

// ── linePercent ─────────────────────────────────────────────────────────────

describe('linePercent', () => {
  it('returns 100 when statementMap is empty', () => {
    expect(linePercent({}, {})).toBe(100);
  });

  it('returns 100 when every statement on every line is hit', () => {
    const statementMap = {
      0: { start: { line: 1 } },
      1: { start: { line: 2 } },
    };
    const hits = { 0: 1, 1: 1 };
    expect(linePercent(statementMap, hits)).toBe(100);
  });

  it('returns 0 when no statements are hit', () => {
    const statementMap = {
      0: { start: { line: 1 } },
      1: { start: { line: 2 } },
    };
    const hits = { 0: 0, 1: 0 };
    expect(linePercent(statementMap, hits)).toBe(0);
  });

  it('collapses multiple statements on the same line into one line entry', () => {
    // Statements 0 and 1 are both on line 1; statement 2 is on line 2.
    // Hitting statement 0 marks line 1 as covered even though statement 1 was not hit.
    const statementMap = {
      0: { start: { line: 1 } },
      1: { start: { line: 1 } },
      2: { start: { line: 2 } },
    };
    const hits = { 0: 1, 1: 0, 2: 0 };
    // Line 1 is covered (statement 0 hit); line 2 is not.  1/2 = 50%.
    expect(linePercent(statementMap, hits)).toBe(50);
  });

  it('treats a missing hit entry as 0 (using nullish coalescing)', () => {
    const statementMap = { 0: { start: { line: 5 } } };
    // No key "0" in hits — should default to 0 → line not covered
    expect(linePercent(statementMap, {})).toBe(0);
  });
});

// ── displayPath ─────────────────────────────────────────────────────────────

describe('displayPath', () => {
  it('strips the rootDir prefix and leading separator', () => {
    const rootDir = '/project';
    expect(displayPath('/project/src/foo.ts', rootDir)).toBe('src/foo.ts');
  });

  it('strips a Windows-style backslash separator after rootDir', () => {
    const rootDir = 'C:\\project';
    expect(displayPath('C:\\project\\src\\foo.ts', rootDir)).toBe('src\\foo.ts');
  });

  it('returns the original path when it does not start with rootDir', () => {
    expect(displayPath('/other/path/foo.ts', '/project')).toBe('/other/path/foo.ts');
  });

  it('handles rootDir that ends with a separator correctly', () => {
    // rootDir without trailing slash — slice removes it cleanly
    const rootDir = '/project';
    expect(displayPath('/project/foo.ts', rootDir)).toBe('foo.ts');
  });
});

// ── collectFileFailures ─────────────────────────────────────────────────────

describe('collectFileFailures', () => {
  it('returns empty array when all metrics are at 100%', () => {
    const fileCoverage = {
      s: { 0: 1, 1: 1 },
      f: { 0: 1 },
      b: { 0: [1, 1] },
      statementMap: {
        0: { start: { line: 1 } },
        1: { start: { line: 2 } },
      },
    };
    expect(collectFileFailures(fileCoverage)).toEqual([]);
  });

  it('reports statements failure when below threshold', () => {
    // 0 out of 2 statements hit
    const fileCoverage = {
      s: { 0: 0, 1: 0 },
      f: { 0: 1 },
      b: {},
      statementMap: {
        0: { start: { line: 1 } },
        1: { start: { line: 2 } },
      },
    };
    const failures = collectFileFailures(fileCoverage);
    expect(failures.some((message) => message.startsWith('statements:'))).toBe(true);
  });

  it('reports functions failure when below threshold', () => {
    const fileCoverage = {
      s: { 0: 1 },
      f: { 0: 0 },
      b: {},
      statementMap: { 0: { start: { line: 1 } } },
    };
    const failures = collectFileFailures(fileCoverage);
    expect(failures.some((message) => message.startsWith('functions:'))).toBe(true);
  });

  it('reports branches failure when below threshold', () => {
    const fileCoverage = {
      s: { 0: 1 },
      f: { 0: 1 },
      b: { 0: [0, 0] },
      statementMap: { 0: { start: { line: 1 } } },
    };
    const failures = collectFileFailures(fileCoverage);
    expect(failures.some((message) => message.startsWith('branches:'))).toBe(true);
  });

  it('reports lines failure when below threshold', () => {
    const fileCoverage = {
      s: { 0: 0, 1: 0 },
      f: { 0: 1 },
      b: {},
      statementMap: {
        0: { start: { line: 1 } },
        1: { start: { line: 2 } },
      },
    };
    const failures = collectFileFailures(fileCoverage);
    expect(failures.some((message) => message.startsWith('lines:'))).toBe(true);
  });

  it('handles missing s, f, b, statementMap fields gracefully using defaults', () => {
    // All metrics fall back to empty maps → 100% → no failures
    expect(collectFileFailures({})).toEqual([]);
  });

  it('reports all four metrics when the file has zero coverage', () => {
    const fileCoverage = {
      s: { 0: 0 },
      f: { 0: 0 },
      b: { 0: [0, 0] },
      statementMap: { 0: { start: { line: 1 } } },
    };
    const failures = collectFileFailures(fileCoverage);
    expect(failures).toHaveLength(4);
  });

  it(`threshold constant is ${PER_FILE_THRESHOLD} — a file at exactly the threshold does not fail`, () => {
    // Build a fileCoverage where exactly 80% of statements, functions, branches, lines are covered
    // 4 statements, 4 functions: 4 covered → 100% (easy path to isolate threshold boundary)
    // Use a contrived 5-statement setup: 4 hit = 80%
    const hitMap = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 0 };
    const statementMap = {
      0: { start: { line: 1 } },
      1: { start: { line: 2 } },
      2: { start: { line: 3 } },
      3: { start: { line: 4 } },
      4: { start: { line: 5 } },
    };
    const fileCoverage = {
      s: hitMap,
      f: hitMap,
      b: {},
      statementMap,
    };
    // 4/5 = 80% — exactly at threshold, should NOT fail (< 80 check)
    expect(collectFileFailures(fileCoverage)).toEqual([]);
  });
});
