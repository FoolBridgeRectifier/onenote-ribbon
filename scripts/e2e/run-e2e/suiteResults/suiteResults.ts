import { SUITE_SEPARATOR } from '../constants';

import type { SuiteRunTotals } from '../interfaces';
import type { SuiteResult } from '../../interfaces';

export function printSuiteResults(
  suiteName: string,
  results: unknown,
): SuiteRunTotals {
  const padText = (text: string, width: number) => text.padEnd(width);
  let passed = 0;
  let failed = 0;

  console.log(`\n  Suite: ${suiteName}`);
  console.log(`  ${SUITE_SEPARATOR}`);

  if (!Array.isArray(results)) {
    console.log(`  ERROR: unexpected result type: ${JSON.stringify(results)}`);
    return { failed: 1, passed: 0 };
  }

  for (const result of results as SuiteResult[]) {
    const icon = result.pass ? '✓' : '✗';
    const label = result.pass ? '' : ' ← FAIL';

    console.log(`  ${icon} ${padText(result.test, 50)}${label}`);

    // Print error details when present so failures are diagnosable without extra tooling.
    const resultDetails = (result as unknown as { details?: string }).details;
    if (!result.pass && resultDetails) {
      console.log(`    ↳ ${resultDetails}`);
    }

    if (result.pass) {
      passed += 1;
    } else {
      failed += 1;
    }
  }

  return { failed, passed };
}
