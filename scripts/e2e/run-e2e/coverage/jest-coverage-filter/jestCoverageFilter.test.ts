import { globToRegex, normalizeRawSourcePath, shouldIncludeSourceFile } from './jestCoverageFilter';

// Sample patterns mirroring the real jest.config.js collectCoverageFrom
const SAMPLE_PATTERNS = [
  'src/**/*.{ts,tsx}',
  '!src/__mocks__/**',
  '!src/e2e/**',
  '!src/test-utils/**',
  '!src/types/**',
  '!src/main.ts',
  '!src/ribbon/**',
  '!src/tabs/home/basic-text/helpers.ts',
  '!src/**/*.test.ts',
  '!src/**/*.test.tsx',
];

describe('globToRegex', () => {
  it('matches a path with ** wildcard', () => {
    const regex = globToRegex('src/**/*.ts');
    expect(regex.test('src/tabs/home/BasicTextGroup.ts')).toBe(true);
    expect(regex.test('src/shared/hooks/useApp.ts')).toBe(true);
  });

  it('does not match files outside the prefix', () => {
    const regex = globToRegex('src/**/*.ts');
    expect(regex.test('scripts/e2e/run-e2e.ts')).toBe(false);
    expect(regex.test('main.ts')).toBe(false);
  });

  it('matches brace group {ts,tsx}', () => {
    const regex = globToRegex('src/**/*.{ts,tsx}');
    expect(regex.test('src/tabs/home/BasicTextGroup.tsx')).toBe(true);
    expect(regex.test('src/shared/hooks/useApp.ts')).toBe(true);
    expect(regex.test('src/tabs/home/styles/basic-text.css')).toBe(false);
  });

  it('matches a single * without crossing directory boundary', () => {
    const regex = globToRegex('src/*/foo.ts');
    expect(regex.test('src/tabs/foo.ts')).toBe(true);
    expect(regex.test('src/tabs/home/foo.ts')).toBe(false);
  });

  it('escapes regex special characters in literal glob parts', () => {
    const regex = globToRegex('src/main.ts');
    expect(regex.test('src/main.ts')).toBe(true);
    // The dot should not be treated as a regex wildcard
    expect(regex.test('src/mainXts')).toBe(false);
  });

  it('handles { without matching } by treating it as a literal brace', () => {
    const regex = globToRegex('src/{unclosed');
    expect(regex.test('src/{unclosed')).toBe(true);
  });
});

describe('normalizeRawSourcePath', () => {
  it('strips a double ../ prefix', () => {
    expect(normalizeRawSourcePath('../../src/tabs/home/BasicTextGroup.tsx')).toBe(
      'src/tabs/home/BasicTextGroup.tsx'
    );
  });

  it('strips a single ../ prefix', () => {
    expect(normalizeRawSourcePath('../src/main.ts')).toBe('src/main.ts');
  });

  it('strips a ./ prefix', () => {
    expect(normalizeRawSourcePath('./src/foo.ts')).toBe('src/foo.ts');
  });

  it('leaves an already-normalized path unchanged', () => {
    expect(normalizeRawSourcePath('src/foo.ts')).toBe('src/foo.ts');
  });

  it('strips prefix from a CSS file path', () => {
    expect(normalizeRawSourcePath('../../styles.css')).toBe('styles.css');
  });
});

describe('shouldIncludeSourceFile', () => {
  it('includes a regular TypeScript source file', () => {
    expect(shouldIncludeSourceFile('src/tabs/home/BasicTextGroup.tsx', SAMPLE_PATTERNS)).toBe(true);
  });

  it('includes a .ts file that matches the include pattern', () => {
    expect(shouldIncludeSourceFile('src/shared/hooks/useFormatPainter.ts', SAMPLE_PATTERNS)).toBe(
      true
    );
  });

  it('excludes a CSS file because it does not match src/**/*.{ts,tsx}', () => {
    expect(
      shouldIncludeSourceFile('src/tabs/home/styles/basic-text-group.css', SAMPLE_PATTERNS)
    ).toBe(false);
  });

  it('excludes a file in src/__mocks__ via negation pattern', () => {
    expect(shouldIncludeSourceFile('src/__mocks__/obsidian.ts', SAMPLE_PATTERNS)).toBe(false);
  });

  it('excludes src/main.ts via explicit negation', () => {
    expect(shouldIncludeSourceFile('src/main.ts', SAMPLE_PATTERNS)).toBe(false);
  });

  it('excludes a test file matching !src/**/*.test.ts', () => {
    expect(shouldIncludeSourceFile('src/tabs/home/BasicTextGroup.test.tsx', SAMPLE_PATTERNS)).toBe(
      false
    );
  });

  it('excludes a file that does not start with src/', () => {
    expect(shouldIncludeSourceFile('styles.css', SAMPLE_PATTERNS)).toBe(false);
  });

  it('excludes src/tabs/home/basic-text/helpers.ts via specific negation', () => {
    expect(shouldIncludeSourceFile('src/tabs/home/basic-text/helpers.ts', SAMPLE_PATTERNS)).toBe(
      false
    );
  });

  it('returns true for all files when patterns array is empty', () => {
    expect(shouldIncludeSourceFile('src/main.ts', [])).toBe(true);
    expect(shouldIncludeSourceFile('styles.css', [])).toBe(true);
  });

  it('excludes a file in src/ribbon via negation pattern', () => {
    expect(shouldIncludeSourceFile('src/ribbon/Ribbon.ts', SAMPLE_PATTERNS)).toBe(false);
  });
});
