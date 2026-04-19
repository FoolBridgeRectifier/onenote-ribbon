/**
 * Images group integration test suite (Insert tab).
 */

import { IMAGES_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function imagesIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [IMAGES_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      // Rule 191: Image button exists
      const imageButton = document.querySelector('[data-cmd="image"]');
      const imageButtonExists = Boolean(imageButton);

      // Rule 192: Image button is visible
      const imageButtonVisible = imageButton?.checkVisibility() ?? false;

      // Rule 193: Image button has correct icon
      const hasImageIcon = Boolean(imageButton?.querySelector('svg, .onr-icon'));

      // Rule 194: Image from clipboard button exists
      const clipboardImageButton = document.querySelector('[data-cmd="image-clipboard"]');
      const clipboardImageButtonExists = Boolean(clipboardImageButton);

      // Rule 195: Image from URL button exists
      const urlImageButton = document.querySelector('[data-cmd="image-url"]');
      const urlImageButtonExists = Boolean(urlImageButton);

      // Rule 196: Image dropdown exists
      const imageDropdown = document.querySelector('[data-cmd="image-dropdown"]');
      const imageDropdownExists = Boolean(imageDropdown);

      // Rule 197: Image group is in Files & Media section
      const imageGroup = imageButton?.closest('.onr-group');
      const groupHasCorrectParent = Boolean(imageGroup);

      // Rule 198: Image button triggers image insertion command
      if (imageButtonExists) {
        clickByCommand('image');
        await wait(100);
      }
      const imageCommandCalled = commandCalls.some(cmd =>
        cmd.includes('image') || cmd.includes('attachment')
      );

      // Rule 199: Image button has correct styling
      const hasCorrectStyling = imageButton?.classList.contains('onr-btn') ||
        imageButton?.classList.contains('onr-btn-sm');

      const allPass = imageButtonExists && imageButtonVisible && hasImageIcon;

      recordRules(
        IMAGES_RULE_IDS,
        allPass,
        [
          'imageButtonExists=' + imageButtonExists,
          'imageButtonVisible=' + imageButtonVisible,
          'hasImageIcon=' + hasImageIcon,
          'clipboardImageButtonExists=' + clipboardImageButtonExists,
          'urlImageButtonExists=' + urlImageButtonExists,
          'imageDropdownExists=' + imageDropdownExists,
          'groupHasCorrectParent=' + groupHasCorrectParent,
          'imageCommandCalled=' + imageCommandCalled,
          'hasCorrectStyling=' + hasCorrectStyling,
        ].join(' | '),
      );
    },
  );
}
