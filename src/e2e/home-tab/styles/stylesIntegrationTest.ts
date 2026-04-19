import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function stylesIntegrationTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('styles-integration', async ({ clickByCommand, wait }) => {
    clickByCommand('styles-expand');
    await wait(120);

    const styleItems = Array.from(
      document.querySelectorAll('.onr-styles-dropdown .onr-dd-item'),
    ).map((itemElement) => (itemElement.textContent || '').trim());

    const styleGroupPass = [
      'Normal',
      'Heading 1',
      'Heading 6',
      'Quote',
      'Code',
    ].every((styleName) =>
      styleItems.some((itemText) => itemText === styleName),
    );

    if (!styleGroupPass) {
      throw new Error('Styles dropdown test failed');
    }
  });
}
