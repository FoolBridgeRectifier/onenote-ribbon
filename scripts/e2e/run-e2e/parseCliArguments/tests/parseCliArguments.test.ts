/** @jest-environment node */

import { parseCliArguments } from '../parseCliArguments';

describe('parseCliArguments', () => {
  it('returns defaults when no flags are provided', () => {
    expect(parseCliArguments([])).toEqual({
      cdpPort: 9222,
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
        '--suite',
        'home, insert ,tags',
      ]),
    ).toEqual({
      cdpPort: 9333,
      keepVault: true,
      launchFresh: true,
      suiteFilter: ['home', 'insert', 'tags'],
    });
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
