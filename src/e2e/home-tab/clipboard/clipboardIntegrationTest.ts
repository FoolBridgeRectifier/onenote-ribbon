import { CLIPBOARD_RULE_IDS, FORMAT_PAINTER_RULE_IDS } from '../home/constants';
import type { HookRuleResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function clipboardIntegrationTest(): Promise<HookRuleResult[]> {
  return runHomeTabSuite(
    [FORMAT_PAINTER_RULE_IDS, CLIPBOARD_RULE_IDS],
    async ({ clickByCommand, recordRules, wait }) => {
      const formatPainterButtonExists = Boolean(
        document.querySelector('[data-cmd="format-painter"]'),
      );
      recordRules(
        FORMAT_PAINTER_RULE_IDS,
        formatPainterButtonExists,
        'formatPainterButtonExists=' + formatPainterButtonExists,
      );

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

      const dropdownItemTexts = Array.from(
        document.querySelectorAll('.onr-dd-item'),
      )
        .map((itemElement) => (itemElement.textContent || '').trim())
        .filter(Boolean);

      const clipboardPass =
        cutButtonExists && copyButtonExists && pasteDropdownButtonExists;

      recordRules(
        CLIPBOARD_RULE_IDS,
        clipboardPass,
        [
          'cut=' + cutButtonExists,
          'copy=' + copyButtonExists,
          'pasteDropdown=' + pasteDropdownButtonExists,
          'dropdownItems=' + dropdownItemTexts.join(', '),
        ].join(' | '),
      );
    },
  );
}
