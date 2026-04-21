import { matchesIgnorePattern } from './jestCoverageFilter';

// Sample patterns mirroring the real jest.config.js coveragePathIgnorePatterns
const SAMPLE_IGNORE_PATTERNS = [
  '/node_modules/',
  '/coverage/',
  '/scripts/',
  '/e2e/',
  '\\.test\\.(ts|tsx|cjs)$',
];

describe('matchesIgnorePattern', () => {
  it('returns true for a path that contains the /node_modules/ substring the pattern expects', () => {
    // The pattern /node_modules/ requires a leading slash; absolute paths satisfy this.
    expect(
      matchesIgnorePattern('C:/project/node_modules/lodash/index.js', SAMPLE_IGNORE_PATTERNS)
    ).toBe(true);
  });

  it('returns true for a test file matching the extension ignore pattern', () => {
    expect(matchesIgnorePattern('src/shared/useApp.test.ts', SAMPLE_IGNORE_PATTERNS)).toBe(true);
  });

  it('returns true for a .cjs test file matching the extension ignore pattern', () => {
    expect(matchesIgnorePattern('scripts/hooks/setup.test.cjs', SAMPLE_IGNORE_PATTERNS)).toBe(true);
  });

  it('returns false for a normal TypeScript source file', () => {
    expect(matchesIgnorePattern('src/shared/hooks/useApp.ts', SAMPLE_IGNORE_PATTERNS)).toBe(false);
  });

  it('returns false when ignorePatterns is empty', () => {
    expect(matchesIgnorePattern('src/main.ts', [])).toBe(false);
  });

  it('returns false and does not throw when a pattern is an invalid regex', () => {
    expect(matchesIgnorePattern('src/main.ts', ['[invalid'])).toBe(false);
  });

  it('returns true for a path matching a pattern with no surrounding slashes', () => {
    expect(matchesIgnorePattern('src/shared/useApp.ts', ['useApp'])).toBe(true);
  });

  it('returns false for a path not matching any pattern', () => {
    expect(matchesIgnorePattern('src/tabs/home/HomeTabPanel.tsx', SAMPLE_IGNORE_PATTERNS)).toBe(
      false
    );
  });
});
