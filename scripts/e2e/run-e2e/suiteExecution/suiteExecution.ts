import fs from 'fs';
import path from 'path';

import { buildSuiteExpression } from '../../suite-loader/buildSuiteExpression';
import { SUITES } from '../../constants';
import { printSuiteResults } from '../suiteResults/suiteResults';

import type { CdpClient } from '../cdpClient/cdpClient';
import type { SuiteResult } from '../../interfaces';

export async function runSuites(
  cdpClient: CdpClient,
  rootPath: string,
  suiteFilter: string[] | null,
) {
  const suitesToRun = suiteFilter
    ? SUITES.filter((suite) => suiteFilter.includes(suite.name))
    : SUITES;

  console.log(`\n[4/4] Running ${suitesToRun.length} suite(s)...`);

  let totalPassed = 0;
  let totalFailed = 0;
  const failedSuites: string[] = [];
  const collectedSuiteResults: SuiteResult[] = [];

  for (const suite of suitesToRun) {
    const testFilePath = path.join(rootPath, suite.file);

    if (!fs.existsSync(testFilePath)) {
      console.log(`  SKIP ${suite.name}: file not found (${suite.file})`);
      continue;
    }

    try {
      const expression = await buildSuiteExpression(testFilePath);
      const results = await cdpClient.eval<SuiteResult[]>(expression);
      const suiteTotals = printSuiteResults(suite.name, results);
      collectedSuiteResults.push(...results);

      totalPassed += suiteTotals.passed;
      totalFailed += suiteTotals.failed;

      if (suiteTotals.failed > 0) {
        failedSuites.push(suite.name);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(`\n  Suite: ${suite.name}`);
      console.log(`  ERROR: ${errorMessage}`);
      failedSuites.push(suite.name);
      totalFailed += 1;
    }
  }

  return {
    allSuiteResults: collectedSuiteResults,
    failedSuites,
    suitesToRun,
    totalFailed,
    totalPassed,
  };
}
