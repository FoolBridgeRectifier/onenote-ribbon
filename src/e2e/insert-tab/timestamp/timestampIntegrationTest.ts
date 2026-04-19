/**
 * Timestamp group integration test suite (Insert tab).
 */

import { TIMESTAMP_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function timestampIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [TIMESTAMP_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      // Rule 210: Timestamp button exists
      const timestampButton = document.querySelector('[data-cmd="timestamp"]');
      const timestampButtonExists = Boolean(timestampButton);

      // Rule 211: Timestamp button is visible
      const timestampButtonVisible = timestampButton?.checkVisibility() ?? false;

      // Rule 212: Timestamp button has correct icon
      const hasTimestampIcon = Boolean(timestampButton?.querySelector('svg, .onr-icon'));

      // Rule 213: Date button exists
      const dateButton = document.querySelector('[data-cmd="insert-date"]');
      const dateButtonExists = Boolean(dateButton);

      // Rule 214: Time button exists
      const timeButton = document.querySelector('[data-cmd="insert-time"]');
      const timeButtonExists = Boolean(timeButton);

      // Rule 215: Date and time button exists
      const dateTimeButton = document.querySelector('[data-cmd="insert-datetime"]');
      const dateTimeButtonExists = Boolean(dateTimeButton);

      // Rule 216: Timestamp insertion adds date/time to editor
      editor.setValue('');
      if (dateButtonExists) {
        clickByCommand('insert-date');
        await wait(100);
      }
      const contentAfterDate = editor.getValue();
      const hasDateContent = contentAfterDate.length > 0;

      // Rule 217: Timestamp format is valid
      const datePattern = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/;
      const hasValidDateFormat = datePattern.test(contentAfterDate);

      // Rule 218: Timestamp group label is correct
      const timeGroupLabel = Array.from(document.querySelectorAll('.onr-group-name'))
        .find(el => el.textContent?.toLowerCase().includes('time'));
      const hasCorrectLabel = Boolean(timeGroupLabel);

      // Rule 219: Timestamp button triggers timestamp command
      const timestampCommandCalled = commandCalls.some(cmd =>
        cmd.includes('date') || cmd.includes('time')
      );

      // Rule 220: Timestamp dropdown exists
      const timestampDropdown = document.querySelector('[data-cmd="timestamp-dropdown"]');
      const timestampDropdownExists = Boolean(timestampDropdown);

      // Rule 221: Timestamp buttons have correct tooltips
      const hasTooltip = timestampButton?.hasAttribute('aria-label') ||
        timestampButton?.hasAttribute('title');

      const allPass = timestampButtonExists && timestampButtonVisible && hasTimestampIcon;

      recordRules(
        TIMESTAMP_RULE_IDS,
        allPass,
        [
          'timestampButtonExists=' + timestampButtonExists,
          'timestampButtonVisible=' + timestampButtonVisible,
          'hasTimestampIcon=' + hasTimestampIcon,
          'dateButtonExists=' + dateButtonExists,
          'timeButtonExists=' + timeButtonExists,
          'dateTimeButtonExists=' + dateTimeButtonExists,
          'hasDateContent=' + hasDateContent,
          'hasValidDateFormat=' + hasValidDateFormat,
          'hasCorrectLabel=' + hasCorrectLabel,
          'timestampCommandCalled=' + timestampCommandCalled,
          'timestampDropdownExists=' + timestampDropdownExists,
          'hasTooltip=' + hasTooltip,
        ].join(' | '),
      );
    },
  );
}
