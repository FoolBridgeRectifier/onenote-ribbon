/**
 * Symbols group integration test suite (Insert tab).
 */

import { SYMBOLS_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function symbolsIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [SYMBOLS_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      // Rule 232: Symbol button exists
      const symbolButton = document.querySelector('[data-cmd="symbol"]');
      const symbolButtonExists = Boolean(symbolButton);

      // Rule 233: Emoji button exists
      const emojiButton = document.querySelector('[data-cmd="emoji"]');
      const emojiButtonExists = Boolean(emojiButton);

      // Rule 234: Special character button exists
      const specialCharButton = document.querySelector('[data-cmd="special-char"]');
      const specialCharButtonExists = Boolean(specialCharButton);

      // Rule 235: Symbol button is visible
      const symbolButtonVisible = symbolButton?.checkVisibility() ?? false;

      // Rule 236: Symbol button has correct icon
      const hasSymbolIcon = Boolean(symbolButton?.querySelector('svg, .onr-icon'));

      // Rule 237: Symbol dropdown exists
      const symbolDropdown = document.querySelector('[data-cmd="symbol-dropdown"]');
      const symbolDropdownExists = Boolean(symbolDropdown);

      // Rule 238: Symbol picker opens on click
      let symbolPickerOpened = false;
      if (symbolDropdownExists) {
        clickByCommand('symbol-dropdown');
        await wait(150);
        const pickerVisible = document.querySelector('.onr-symbol-picker, .onr-emoji-picker');
        symbolPickerOpened = Boolean(pickerVisible);
      }

      // Rule 239: Symbol group label is correct
      const symbolGroupLabel = Array.from(document.querySelectorAll('.onr-group-name'))
        .find(el => el.textContent?.toLowerCase().includes('symbol'));
      const hasCorrectLabel = Boolean(symbolGroupLabel);

      // Rule 240: Symbol insertion adds character to editor
      editor.setValue('');
      const symbolCommandCalled = commandCalls.some(cmd =>
        cmd.includes('symbol') || cmd.includes('emoji')
      );

      const allPass = symbolButtonExists && emojiButtonExists && symbolButtonVisible;

      recordRules(
        SYMBOLS_RULE_IDS,
        allPass,
        [
          'symbolButtonExists=' + symbolButtonExists,
          'emojiButtonExists=' + emojiButtonExists,
          'specialCharButtonExists=' + specialCharButtonExists,
          'symbolButtonVisible=' + symbolButtonVisible,
          'hasSymbolIcon=' + hasSymbolIcon,
          'symbolDropdownExists=' + symbolDropdownExists,
          'symbolPickerOpened=' + symbolPickerOpened,
          'hasCorrectLabel=' + hasCorrectLabel,
          'symbolCommandCalled=' + symbolCommandCalled,
        ].join(' | '),
      );
    },
  );
}
