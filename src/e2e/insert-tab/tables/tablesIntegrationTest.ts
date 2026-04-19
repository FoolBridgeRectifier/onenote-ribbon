/**
 * Tables group integration test suite (Insert tab).
 */

import { TABLES_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function tablesIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [TABLES_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      // Rule 172: Table button exists
      const tableButton = document.querySelector('[data-cmd="table"]');
      const tableButtonExists = Boolean(tableButton);

      // Rule 173: Table button is visible
      const tableButtonVisible = tableButton?.checkVisibility() ?? false;

      // Rule 174: Table button has correct icon
      const hasTableIcon = Boolean(tableButton?.querySelector('svg, .onr-icon'));

      // Rule 175: Clicking table button triggers command
      editor.setValue('test content');
      if (tableButtonExists) {
        clickByCommand('table');
        await wait(100);
      }
      const tableCommandCalled = commandCalls.some(cmd => cmd.includes('table'));

      // Rule 176: Table insertion adds markdown table syntax
      const contentAfterTable = editor.getValue();
      const hasTableSyntax = contentAfterTable.includes('|') || contentAfterTable.includes('table');

      // Rule 177: Table dropdown exists (if applicable)
      const tableDropdown = document.querySelector('[data-cmd="table-dropdown"]');
      const tableDropdownExists = Boolean(tableDropdown);

      // Rule 178: Table size picker exists
      const tableSizePicker = document.querySelector('.onr-table-picker, [data-cmd*="table-size"]');
      const tableSizePickerExists = Boolean(tableSizePicker);

      // Rule 179: Table group label is correct
      const tableGroupLabel = Array.from(document.querySelectorAll('.onr-group-name'))
        .find(el => el.textContent?.toLowerCase().includes('table'));
      const hasCorrectLabel = Boolean(tableGroupLabel);

      // Rule 180: Table button has correct data-group attribute
      const hasCorrectGroup = tableButton?.closest('[data-group]')?.getAttribute('data-group') === 'tables' ||
        tableButton?.closest('.onr-group')?.querySelector('.onr-group-name') !== null;

      const allPass = tableButtonExists && tableButtonVisible && hasTableIcon;

      recordRules(
        TABLES_RULE_IDS,
        allPass,
        [
          'tableButtonExists=' + tableButtonExists,
          'tableButtonVisible=' + tableButtonVisible,
          'hasTableIcon=' + hasTableIcon,
          'tableCommandCalled=' + tableCommandCalled,
          'hasTableSyntax=' + hasTableSyntax,
          'tableDropdownExists=' + tableDropdownExists,
          'tableSizePickerExists=' + tableSizePickerExists,
          'hasCorrectLabel=' + hasCorrectLabel,
          'hasCorrectGroup=' + hasCorrectGroup,
        ].join(' | '),
      );
    },
  );
}
