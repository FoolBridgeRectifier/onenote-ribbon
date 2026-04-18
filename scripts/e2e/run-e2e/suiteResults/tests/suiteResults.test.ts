/** @jest-environment node */

import { printSuiteResults } from '../suiteResults';

describe('printSuiteResults', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns passed and failed counts for valid suite results', () => {
    const results = [
      { test: 'test-1', pass: true },
      { test: 'test-2', pass: false },
      { test: 'test-3', pass: true },
    ];

    const totals = printSuiteResults('example-suite', results);

    expect(totals).toEqual({ passed: 2, failed: 1 });
    expect(console.log).toHaveBeenCalledWith('\n  Suite: example-suite');
  });

  it('returns error result when input is not an array', () => {
    const totals = printSuiteResults('bad-suite', { invalid: 'data' });

    expect(totals).toEqual({ passed: 0, failed: 1 });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ERROR'));
  });

  it('prints passing tests with checkmark icon', () => {
    const results = [{ test: 'passing-test', pass: true }];

    printSuiteResults('suite', results);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✓'));
  });

  it('prints failing tests with X icon and FAIL label', () => {
    const results = [{ test: 'failing-test', pass: false }];

    printSuiteResults('suite', results);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✗'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('FAIL'));
  });

  it('handles empty results array', () => {
    const totals = printSuiteResults('empty-suite', []);

    expect(totals).toEqual({ passed: 0, failed: 0 });
  });
});
