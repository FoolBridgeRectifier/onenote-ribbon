import {
  EDITOR_READY_TIMEOUT_MS,
  POST_MODAL_WAIT_MS,
  RIBBON_READY_TIMEOUT_MS,
  RIBBON_PANEL_SELECTOR,
  TEMP_NOTE_EDITOR_CONTENT,
  TRUST_MODAL_BUTTON_LABELS,
  WORKSPACE_READY_TIMEOUT_MS,
} from '../constants';
import { pollUntil, sleep } from '../polling/polling';

import type { CdpClient } from '../cdpClient/cdpClient';

const CDP_EVALUATE_TIMEOUT_MS = 5000;

async function evaluateWithTimeout<TResult>(
  cdpClient: CdpClient,
  expression: string,
  awaitPromise = true,
): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      reject(
        new Error(`CDP evaluate timed out after ${CDP_EVALUATE_TIMEOUT_MS}ms`),
      );
    }, CDP_EVALUATE_TIMEOUT_MS);

    cdpClient
      .eval<TResult>(expression, awaitPromise)
      .then((value) => {
        clearTimeout(timeoutHandle);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
  });
}

export async function dismissTrustModal(
  cdpClient: CdpClient,
  waitAfterDismiss = true,
) {
  const trustButtonClicked = await evaluateWithTimeout<boolean>(
    cdpClient,
    `
      (() => {
        const normalizedTrustLabels = ${JSON.stringify(TRUST_MODAL_BUTTON_LABELS)}.map((label) => label.toLowerCase());
        const buttonElements = Array.from(document.querySelectorAll('button'));

        for (const buttonElement of buttonElements) {
          const buttonText = (buttonElement.textContent || '').trim().toLowerCase();
          const isTrustButton = normalizedTrustLabels.some((label) => buttonText.includes(label));

          if (isTrustButton || buttonElement.classList.contains('mod-cta')) {
            buttonElement.click();
            return true;
          }
        }

        return false;
      })();
    `,
    false,
  ).catch(() => false);

  if (trustButtonClicked && waitAfterDismiss) {
    await sleep(POST_MODAL_WAIT_MS);
  }

  return trustButtonClicked;
}

export async function waitForWorkspaceAndRibbon(cdpClient: CdpClient) {
  await pollUntil(
    async () => {
      await dismissTrustModal(cdpClient, false);
      return evaluateWithTimeout<boolean>(cdpClient, '!!app?.workspace', false);
    },
    {
      label: 'app.workspace',
      timeout: WORKSPACE_READY_TIMEOUT_MS,
    },
  );

  await pollUntil(
    async () => {
      await dismissTrustModal(cdpClient, false);
      return evaluateWithTimeout<boolean>(
        cdpClient,
        `!!document.querySelector(${JSON.stringify(RIBBON_PANEL_SELECTOR)})`,
        false,
      );
    },
    {
      label: `ribbon DOM (${RIBBON_PANEL_SELECTOR})`,
      timeout: RIBBON_READY_TIMEOUT_MS,
    },
  );
}

export async function ensureEditorOpen(
  cdpClient: CdpClient,
  tempNoteFileName: string,
) {
  try {
    const hasEditor = await evaluateWithTimeout<boolean>(
      cdpClient,
      '!!app.workspace.activeEditor?.editor',
      false,
    );

    if (hasEditor) {
      return;
    }
  } catch {
    // Ignore pre-check errors and continue with note creation.
  }

  await cdpClient.eval(
    `
      (async () => {
        const fileName = ${JSON.stringify(tempNoteFileName)};
        const content = ${JSON.stringify(TEMP_NOTE_EDITOR_CONTENT)};
        try { await app.vault.create(fileName, content); } catch {}
        await app.workspace.openLinkText(fileName, '', true);
      })()
    `,
  );

  await pollUntil(
    () =>
      evaluateWithTimeout<boolean>(
        cdpClient,
        '!!app.workspace.activeEditor?.editor',
        false,
      ),
    { label: 'active editor', timeout: EDITOR_READY_TIMEOUT_MS },
  );
}

export async function cleanupTempNote(
  cdpClient: CdpClient,
  tempNoteFileName: string,
) {
  try {
    await cdpClient.eval(
      `
        (async () => {
          const file = app.vault.getAbstractFileByPath(${JSON.stringify(tempNoteFileName)});
          if (file) {
            await app.vault.delete(file);
          }
        })()
      `,
    );
  } catch {
    // Best-effort cleanup only.
  }
}
