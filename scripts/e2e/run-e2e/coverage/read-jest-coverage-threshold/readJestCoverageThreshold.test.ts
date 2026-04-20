/** @jest-environment node */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { readJestCoverageLineThreshold } from './readJestCoverageThreshold';

describe('readJestCoverageLineThreshold', () => {
  const temporaryDirectoryPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'onr-jest-threshold-'),
  );

  afterAll(() => {
    fs.rmSync(temporaryDirectoryPath, { force: true, recursive: true });
  });

  it('returns line threshold from jest.config.js', () => {
    const projectDirectoryPath = path.join(temporaryDirectoryPath, 'project-a');
    fs.mkdirSync(projectDirectoryPath, { recursive: true });

    fs.writeFileSync(
      path.join(projectDirectoryPath, 'jest.config.js'),
      `module.exports = { coverageThreshold: { global: { lines: 87 } } };`,
      'utf8',
    );

    expect(readJestCoverageLineThreshold(projectDirectoryPath)).toBe(87);
  });

  it('returns null when jest config file is missing', () => {
    const projectDirectoryPath = path.join(temporaryDirectoryPath, 'project-b');
    fs.mkdirSync(projectDirectoryPath, { recursive: true });

    expect(readJestCoverageLineThreshold(projectDirectoryPath)).toBeNull();
  });

  it('returns null when lines threshold is absent', () => {
    const projectDirectoryPath = path.join(temporaryDirectoryPath, 'project-c');
    fs.mkdirSync(projectDirectoryPath, { recursive: true });

    fs.writeFileSync(
      path.join(projectDirectoryPath, 'jest.config.js'),
      `module.exports = { coverageThreshold: { global: { statements: 80 } } };`,
      'utf8',
    );

    expect(readJestCoverageLineThreshold(projectDirectoryPath)).toBeNull();
  });
});
