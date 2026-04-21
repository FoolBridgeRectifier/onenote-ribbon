import * as path from 'path';

import { readJestConfigArray } from './helpers';

// The workspace root contains the real jest.config.js — use it for integration tests.
// __dirname is scripts/e2e/run-e2e/coverage/jest-coverage-filter, so 5 levels up = project root.
const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../..');

describe('readJestConfigArray', () => {
  it('returns a non-empty array for collectCoverageFrom from the real jest config', () => {
    const patterns = readJestConfigArray(WORKSPACE_ROOT, 'collectCoverageFrom');
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns.some((pattern) => pattern.includes('src/**/*.{ts,tsx}'))).toBe(true);
  });

  it('returns a non-empty array for coveragePathIgnorePatterns from the real jest config', () => {
    const patterns = readJestConfigArray(WORKSPACE_ROOT, 'coveragePathIgnorePatterns');
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns.some((pattern) => pattern.includes('node_modules'))).toBe(true);
  });

  it('returns an empty array for a property that does not exist in the config', () => {
    const patterns = readJestConfigArray(WORKSPACE_ROOT, 'nonExistentProperty');
    expect(patterns).toEqual([]);
  });

  it('returns an empty array when rootPath does not contain jest.config.js', () => {
    const patterns = readJestConfigArray('/nonexistent/path', 'collectCoverageFrom');
    expect(patterns).toEqual([]);
  });
});
