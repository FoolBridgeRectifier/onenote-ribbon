import type { SuiteTestResult } from '../helpers/interfaces';

export const wait = (milliseconds: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function runRibbonSuite(
  testName: string,
  callback: () => Promise<void> | void
): Promise<SuiteTestResult[]> {
  try {
    await callback();
    return [{ test: testName, pass: true }];
  } catch (_error) {
    return [{ test: testName, pass: false, details: String(_error) }];
  }
}
