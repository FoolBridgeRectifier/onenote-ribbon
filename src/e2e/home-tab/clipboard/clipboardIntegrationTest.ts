import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function clipboardIntegrationTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('clipboard-integration', async ({ clickByCommand, wait }) => {
    const formatPainterButtonExists = Boolean(
      document.querySelector('[data-cmd="format-painter"]'),
    );
    if (!formatPainterButtonExists) {
      throw new Error('Format painter button not found');
    }

    const cutButtonExists = Boolean(
      document.querySelector('[data-cmd="cut"]'),
    );
    const copyButtonExists = Boolean(
      document.querySelector('[data-cmd="copy"]'),
    );
    const pasteDropdownButtonExists = Boolean(
      document.querySelector('[data-cmd="paste-dropdown"]'),
    );

    clickByCommand('paste-dropdown');
    await wait(120);

    const _dropdownItemTexts = Array.from(
      document.querySelectorAll('.onr-dd-item'),
    )
      .map((itemElement) => (itemElement.textContent || '').trim())
      .filter(Boolean);

    const clipboardPass =
      cutButtonExists && copyButtonExists && pasteDropdownButtonExists;

    if (!clipboardPass) {
      throw new Error('Clipboard buttons test failed');
    }
  });
}
