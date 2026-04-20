import type { App } from 'obsidian';
import { Notice } from 'obsidian';

import { EMAIL_SUBJECT_PREFIX, EML_DELETE_DELAY_MS } from '../../constants';
import type { SendNoteByEmailDependencies } from '../../interfaces';
import { buildObsidianHtml } from '../obsidian-html/ObsidianHtml';
import { buildEmlWithPdfAttachment } from '../eml-builder/EmlBuilder';
import { generatePdfFromHtml } from '../pdf-generator/PdfGenerator';

/**
 * Creates the real, Electron-backed implementation of SendNoteByEmailDependencies.
 * Uses Node.js fs/os/path for file writing and electron.shell for opening the
 * generated EML file with the system default email client.
 *
 * NOTE: Uses require() at call time (not module load time) so that tests
 * running in jsdom never attempt to load the Electron/Node modules.
 */
export function createDefaultSendDependencies(): SendNoteByEmailDependencies {
  return {
    buildHtml: (markdown: string, noteTitle: string): Promise<string> => {
      // eslint-disable-next-line strict-structure/no-double-cast -- Obsidian attaches `app` to `window` at runtime; not exposed in the DOM Window type
      const obsidianApp = (window as unknown as { app: App }).app;
      const file = obsidianApp.workspace.getActiveFile();
      return buildObsidianHtml(obsidianApp, markdown, noteTitle, file);
    },

    writeEmlToTemp: (emlContent: string, noteTitle: string): string => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const os = require('os');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // Replace characters that are unsafe in file names with a space
      const safeFileName = noteTitle.replace(/[^\w\s-]/g, '').trim() + '.eml';
      const filePath = path.join(os.tmpdir(), safeFileName);
      fs.writeFileSync(filePath, emlContent, 'utf-8');
      return filePath;
    },

    openEmlFile: async (filePath: string): Promise<void> => {
      // shell.openPath opens the file with the OS-registered default handler
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { shell } = require('electron');
      await shell.openPath(filePath);
    },

    displayNotice: (message: string): void => {
      new Notice(message);
    },

    generatePdf: (htmlContent: string): Promise<Buffer> => {
      return generatePdfFromHtml(htmlContent);
    },

    deleteFile: (filePath: string): void => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore deletion errors — the OS temp directory will eventually reclaim the file
      }
    },
  };
}

/**
 * Converts the given markdown to a PDF attachment, builds an EML file
 * containing the PDF with a generic body message, writes it to the OS temp
 * directory, opens it with the system default email client, then schedules
 * deletion of the temp file once the email client has had time to read it.
 *
 * The `dependencies` parameter allows injecting mocks in tests. When omitted,
 * the real Electron implementations are used.
 */
export async function sendNoteByEmail(
  markdownContent: string,
  noteTitle: string,
  dependencies: SendNoteByEmailDependencies = createDefaultSendDependencies()
): Promise<void> {
  const htmlContent = await dependencies.buildHtml(markdownContent, noteTitle);
  const subject = EMAIL_SUBJECT_PREFIX + noteTitle;

  const pdfBuffer = await dependencies.generatePdf(htmlContent);
  const emlContent = buildEmlWithPdfAttachment(pdfBuffer, subject, noteTitle);

  const savedEmlPath = dependencies.writeEmlToTemp(emlContent, noteTitle);
  await dependencies.openEmlFile(savedEmlPath);

  // Schedule EML cleanup after the email client has had time to read the file
  setTimeout(() => {
    dependencies.deleteFile(savedEmlPath);
  }, EML_DELETE_DELAY_MS);

  dependencies.displayNotice('Opening your email client...');
}
