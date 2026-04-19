import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function navigateIntegrationTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('navigate-integration', async ({
    clickByCommand,
    commandCalls,
    wait,
  }) => {
    clickByCommand('outline');
    clickByCommand('fold-all');
    clickByCommand('unfold-all');
    await wait(120);

    const navigatePass =
      commandCalls.includes('outline:open') &&
      commandCalls.includes('editor:fold-all') &&
      commandCalls.includes('editor:unfold-all');

    if (!navigatePass) {
      throw new Error('Navigate commands test failed');
    }
  });
}
