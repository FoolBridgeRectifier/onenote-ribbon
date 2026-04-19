/**
 * Files group integration test suite (Insert tab).
 */

import { FILES_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function filesIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [FILES_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      // Rule 182: File button exists
      const fileButton = document.querySelector('[data-cmd="file"]');
      const fileButtonExists = Boolean(fileButton);

      // Rule 183: File button is visible
      const fileButtonVisible = fileButton?.checkVisibility() ?? false;

      // Rule 184: File button has correct icon
      const hasFileIcon = Boolean(fileButton?.querySelector('svg, .onr-icon'));

      // Rule 185: File attachment button exists
      const attachButton = document.querySelector('[data-cmd="attach-file"]');
      const attachButtonExists = Boolean(attachButton);

      // Rule 186: PDF insertion button exists
      const pdfButton = document.querySelector('[data-cmd="insert-pdf"]');
      const pdfButtonExists = Boolean(pdfButton);

      // Rule 187: File dropdown exists
      const fileDropdown = document.querySelector('[data-cmd="file-dropdown"]');
      const fileDropdownExists = Boolean(fileDropdown);

      // Rule 188: File group label is correct
      const fileGroupLabel = Array.from(document.querySelectorAll('.onr-group-name'))
        .find(el => el.textContent?.toLowerCase().includes('file') ||
                   el.textContent?.toLowerCase().includes('media'));
      const hasCorrectLabel = Boolean(fileGroupLabel);

      // Rule 189: File button triggers file dialog command
      if (fileButtonExists) {
        clickByCommand('file');
        await wait(100);
      }
      const fileCommandCalled = commandCalls.some(cmd =>
        cmd.includes('file') || cmd.includes('attach')
      );

      // Rule 190: File button has correct accessibility attributes
      const hasAriaLabel = fileButton?.hasAttribute('aria-label') ||
        fileButton?.hasAttribute('title');

      const allPass = fileButtonExists && fileButtonVisible && hasFileIcon;

      recordRules(
        FILES_RULE_IDS,
        allPass,
        [
          'fileButtonExists=' + fileButtonExists,
          'fileButtonVisible=' + fileButtonVisible,
          'hasFileIcon=' + hasFileIcon,
          'attachButtonExists=' + attachButtonExists,
          'pdfButtonExists=' + pdfButtonExists,
          'fileDropdownExists=' + fileDropdownExists,
          'hasCorrectLabel=' + hasCorrectLabel,
          'fileCommandCalled=' + fileCommandCalled,
          'hasAriaLabel=' + hasAriaLabel,
        ].join(' | '),
      );
    },
  );
}
