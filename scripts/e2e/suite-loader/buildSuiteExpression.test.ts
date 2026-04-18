/** @jest-environment node */

import * as path from 'path';
import * as vm from 'vm';

import { buildSuiteExpression } from './buildSuiteExpression';

describe('buildSuiteExpression', () => {
  it('bundles imported helper code for function exports', async () => {
    const fixtureFilePath = path.resolve(
      __dirname,
      'fixtures/functionSuite.ts',
    );

    const expression = await buildSuiteExpression(fixtureFilePath);
    const result = await vm.runInNewContext(expression, {});

    expect(result).toEqual([
      { test: 'from-helper', pass: true, details: 'function export works' },
    ]);
  });

  it('rejects non-function suite exports', async () => {
    const fixtureFilePath = path.resolve(
      __dirname,
      'fixtures/nonFunctionSuite.ts',
    );

    const expression = await buildSuiteExpression(fixtureFilePath);
    expect(() => vm.runInNewContext(expression, {})).toThrow(
      'No function suite export found in bundled module',
    );
  });
});
