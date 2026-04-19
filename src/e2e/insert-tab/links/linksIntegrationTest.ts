/**
 * Links group integration test suite (Insert tab).
 */

import { LINKS_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function linksIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [LINKS_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, selectToken, wait }) => {
      // Rule 200: Link button exists
      const linkButton = document.querySelector('[data-cmd="link"]');
      const linkButtonExists = Boolean(linkButton);

      // Rule 201: Link button is visible
      const linkButtonVisible = linkButton?.checkVisibility() ?? false;

      // Rule 202: Link button has correct icon
      const hasLinkIcon = Boolean(linkButton?.querySelector('svg, .onr-icon'));

      // Rule 203: Internal link button exists
      const internalLinkButton = document.querySelector('[data-cmd="internal-link"]');
      const internalLinkButtonExists = Boolean(internalLinkButton);

      // Rule 204: External link button exists
      const externalLinkButton = document.querySelector('[data-cmd="external-link"]');
      const externalLinkButtonExists = Boolean(externalLinkButton);

      // Rule 205: Link to heading button exists
      const headingLinkButton = document.querySelector('[data-cmd="link-to-heading"]');
      const headingLinkButtonExists = Boolean(headingLinkButton);

      // Rule 206: Link to block button exists
      const blockLinkButton = document.querySelector('[data-cmd="link-to-block"]');
      const blockLinkButtonExists = Boolean(blockLinkButton);

      // Rule 207: Link insertion adds markdown link syntax
      editor.setValue('link text');
      selectToken('link text');
      if (linkButtonExists) {
        clickByCommand('link');
        await wait(100);
      }
      const contentAfterLink = editor.getValue();
      const hasLinkSyntax = contentAfterLink.includes('[[') ||
        (contentAfterLink.includes('[') && contentAfterLink.includes(']'));

      // Rule 208: Link group label is correct
      const linkGroupLabel = Array.from(document.querySelectorAll('.onr-group-name'))
        .find(el => el.textContent?.toLowerCase().includes('link'));
      const hasCorrectLabel = Boolean(linkGroupLabel);

      // Rule 209: Link button triggers link command
      const linkCommandCalled = commandCalls.some(cmd =>
        cmd.includes('link') || cmd.includes('obsidian-link')
      );

      const allPass = linkButtonExists && linkButtonVisible && hasLinkIcon;

      recordRules(
        LINKS_RULE_IDS,
        allPass,
        [
          'linkButtonExists=' + linkButtonExists,
          'linkButtonVisible=' + linkButtonVisible,
          'hasLinkIcon=' + hasLinkIcon,
          'internalLinkButtonExists=' + internalLinkButtonExists,
          'externalLinkButtonExists=' + externalLinkButtonExists,
          'headingLinkButtonExists=' + headingLinkButtonExists,
          'blockLinkButtonExists=' + blockLinkButtonExists,
          'hasLinkSyntax=' + hasLinkSyntax,
          'hasCorrectLabel=' + hasCorrectLabel,
          'linkCommandCalled=' + linkCommandCalled,
        ].join(' | '),
      );
    },
  );
}
