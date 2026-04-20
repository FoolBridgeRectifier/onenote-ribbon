/** @jest-environment node */

import { parseCliArguments } from './parseCliArguments';

describe('parseCliArguments', () => {
  it('returns defaults when no flags are provided', () => {
    expect(parseCliArguments([])).toEqual({
      cdpPort: 9222,
      codeCoverageMode: false,
      coverageHtml: false,
      coverageReport: false,
      coverageThreshold: null,
      keepVault: false,
      launchFresh: false,
      suiteFilter: null,
    });
  });

  it('parses all supported flags', () => {
    expect(
      parseCliArguments([
        '--port',
        '9333',
        '--launch',
        '--keep-vault',
        '--code-coverage',
        '--coverage-html',
        '--coverage-report',
        '--coverage-threshold',
        '100',
        '--suite',
        'home, insert ,tags',
      ]),
    ).toEqual({
      cdpPort: 9333,
      codeCoverageMode: true,
      coverageHtml: true,
      coverageReport: true,
      coverageThreshold: 100,
      keepVault: true,
      launchFresh: true,
      suiteFilter: ['home', 'insert', 'tags'],
    });
  });

  it('throws when coverage threshold is invalid', () => {
    expect(() => parseCliArguments(['--coverage-threshold', 'oops'])).toThrow(
      'Invalid value for --coverage-threshold: oops',
    );
  });

  it('throws when coverage threshold is outside 0-100', () => {
    expect(() => parseCliArguments(['--coverage-threshold', '140'])).toThrow(
      'Expected --coverage-threshold to be between 0 and 100: 140',
    );
  });

  it('throws when the port value is invalid', () => {
    expect(() => parseCliArguments(['--port', 'abc'])).toThrow(
      'Invalid value for --port: abc',
    );
  });

  it('throws when a required flag value is missing', () => {
    expect(() => parseCliArguments(['--suite'])).toThrow(
      'Missing value for --suite',
    );
  });

  it('throws when suite names are empty after trimming', () => {
    expect(() => parseCliArguments(['--suite', ' , '])).toThrow(
      'Expected at least one suite name after --suite',
    );
  });
});
