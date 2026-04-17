import { App, Component, MarkdownRenderer, Notice, TFile } from 'obsidian';

import {
  EMAIL_BODY_TEXT,
  EMAIL_SUBJECT_PREFIX,
  EML_BOUNDARY,
  EML_DELETE_DELAY_MS,
  NOTE_EXPORT_STYLES,
} from './constants';
import type { SendNoteByEmailDependencies } from './interfaces';
import { generatePdfFromHtml } from './pdfExport';

// ── Internal HTML helpers ─────────────────────────────────────────────────────

/** Escapes characters that carry special meaning in HTML to safe entity forms. */
function escapeHtmlEntities(rawText: string): string {
  return rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Applies inline markdown transformations to a single line of text.
 * Handles bold, italic, strikethrough, inline code, and highlights.
 * Does NOT escape HTML — callers must ensure the input is safe or already HTML.
 */
function convertInlineMarkdown(line: string): string {
  return line
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>');
}

// ── Public: HTML document building ───────────────────────────────────────────

/**
 * Converts a full markdown string to an HTML body fragment.
 * Handles headings, paragraphs, bold/italic/strikethrough, lists,
 * blockquotes, code blocks, horizontal rules, and inline code.
 * HTML tags already present in the content are passed through unchanged.
 */
export function convertMarkdownToHtmlBody(markdownContent: string): string {
  const lines = markdownContent.split('\n');
  const outputLines: string[] = [];

  let isInsideCodeBlock = false;
  let isInsideUnorderedList = false;
  let isInsideOrderedList = false;
  let isInsideBlockquote = false;

  const closeOpenLists = () => {
    if (isInsideUnorderedList) {
      outputLines.push('</ul>');
      isInsideUnorderedList = false;
    }
    if (isInsideOrderedList) {
      outputLines.push('</ol>');
      isInsideOrderedList = false;
    }
  };

  const closeBlockquote = () => {
    if (isInsideBlockquote) {
      outputLines.push('</blockquote>');
      isInsideBlockquote = false;
    }
  };

  for (const line of lines) {
    // Opening or closing a fenced code block (``` ... ```)
    if (line.startsWith('```')) {
      closeOpenLists();
      closeBlockquote();
      if (isInsideCodeBlock) {
        outputLines.push('</code></pre>');
        isInsideCodeBlock = false;
      } else {
        outputLines.push('<pre><code>');
        isInsideCodeBlock = true;
      }
      continue;
    }

    // Inside a code block — escape HTML entities; no further markdown processing
    if (isInsideCodeBlock) {
      outputLines.push(escapeHtmlEntities(line));
      continue;
    }

    // Horizontal rule: --- or ***
    if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim())) {
      closeOpenLists();
      closeBlockquote();
      outputLines.push('<hr>');
      continue;
    }

    // ATX headings: # through ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeOpenLists();
      closeBlockquote();
      const level = headingMatch[1].length;
      const headingText = convertInlineMarkdown(headingMatch[2]);
      outputLines.push(`<h${level}>${headingText}</h${level}>`);
      continue;
    }

    // Blockquote: lines starting with "> "
    if (line.startsWith('> ')) {
      closeOpenLists();
      if (!isInsideBlockquote) {
        outputLines.push('<blockquote>');
        isInsideBlockquote = true;
      }
      outputLines.push(`<p>${convertInlineMarkdown(line.slice(2))}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    // Unordered list item: -, *, or + followed by a space
    const unorderedListMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedListMatch) {
      if (isInsideOrderedList) closeOpenLists();
      if (!isInsideUnorderedList) {
        outputLines.push('<ul>');
        isInsideUnorderedList = true;
      }
      outputLines.push(
        `<li>${convertInlineMarkdown(unorderedListMatch[1])}</li>`,
      );
      continue;
    }

    // Ordered list item: digit(s) followed by ". "
    const orderedListMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedListMatch) {
      if (isInsideUnorderedList) closeOpenLists();
      if (!isInsideOrderedList) {
        outputLines.push('<ol>');
        isInsideOrderedList = true;
      }
      outputLines.push(
        `<li>${convertInlineMarkdown(orderedListMatch[1])}</li>`,
      );
      continue;
    }

    // Reaching here means the current line is not a list item
    closeOpenLists();

    // Empty line — preserve as whitespace separator
    if (line.trim() === '') {
      outputLines.push('');
      continue;
    }

    // Regular paragraph line
    outputLines.push(`<p>${convertInlineMarkdown(line)}</p>`);
  }

  // Ensure any unclosed structures are properly closed
  closeOpenLists();
  closeBlockquote();
  if (isInsideCodeBlock) {
    outputLines.push('</code></pre>');
  }

  return outputLines.join('\n');
}

/**
 * Builds a complete, self-contained HTML document from markdown content.
 * The document includes print-friendly styles matching markdown conventions.
 */
export function buildNoteHtml(
  markdownContent: string,
  noteTitle: string,
): string {
  const escapedTitle = escapeHtmlEntities(noteTitle);
  const bodyHtml = convertMarkdownToHtmlBody(markdownContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapedTitle}</title>
  <style>${NOTE_EXPORT_STYLES}</style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  ${bodyHtml}
</body>
</html>`;
}

// ── Obsidian-native HTML rendering ────────────────────────────────────────────

/**
 * CSS properties to snapshot from each rendered element and inline into the
 * HTML sent to the PDF BrowserWindow. Skipping font-family avoids referencing
 * fonts that exist only in the Obsidian process.
 */
const INLINE_STYLE_PROPERTIES = [
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'color',
  'background-color',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-left-width',
  'border-left-color',
  'border-left-style',
  'border-top-width',
  'border-top-color',
  'border-top-style',
  'text-decoration',
  'text-align',
  'border-radius',
  'display',
  'vertical-align',
] as const;

/**
 * Walks every descendant element of `root` and writes its live computed CSS
 * values as inline styles. This makes the HTML self-contained — the isolated
 * BrowserWindow used for PDF generation needs no external stylesheet.
 */
function inlineComputedStylesOnAllElements(root: HTMLElement): void {
  const elements = root.querySelectorAll('*');
  for (const element of Array.from(elements)) {
    const computed = window.getComputedStyle(element as HTMLElement);
    const styleEntries: string[] = [];

    for (const property of INLINE_STYLE_PROPERTIES) {
      const value = computed.getPropertyValue(property);
      if (value !== '') {
        styleEntries.push(`${property}:${value}`);
      }
    }

    (element as HTMLElement).style.cssText = styleEntries.join(';');
  }
}

/**
 * Renders markdown using Obsidian's own MarkdownRenderer into a hidden
 * off-screen container, inlines all computed CSS values onto every element,
 * strips Obsidian UI chrome (collapse indicators, metadata header), and returns
 * a complete self-contained HTML document ready for Electron's printToPDF.
 *
 * Because styles are inlined from live computed values, the PDF will match
 * exactly what Obsidian's reading view displays for the active theme.
 */
export async function buildObsidianHtml(
  app: App,
  markdown: string,
  noteTitle: string,
  file: TFile | null,
): Promise<string> {
  // Render in a hidden off-screen container so getComputedStyle returns live values
  const container = document.createElement('div');
  container.className = 'markdown-preview-view markdown-rendered';
  // 800px matches a typical readable-line-width in Obsidian
  container.style.cssText =
    'position:absolute;left:-9999px;top:0;width:800px;visibility:hidden;';
  document.body.appendChild(container);

  const component = new Component();
  component.load();

  const filePath = file?.path ?? '';
  await MarkdownRenderer.render(app, markdown, container, filePath, component);

  // Wait a tick for any async rendering (embeds, live-preview plugins) to settle
  await new Promise<void>((resolve) => setTimeout(resolve, 100));

  // Remove Obsidian UI chrome that has no place in a printed PDF
  const obsidianUiSelectors = [
    '.markdown-preview-pusher',
    '.mod-header',
    '.heading-collapse-indicator',
    '.list-collapse-indicator',
    '.collapse-indicator',
    '.metadata-container',
  ];
  for (const selector of obsidianUiSelectors) {
    container.querySelectorAll(selector).forEach((element) => element.remove());
  }

  // Snapshot computed styles onto every element before leaving the Obsidian context
  inlineComputedStylesOnAllElements(container);

  const bodyHtml = container.innerHTML;

  component.unload();
  document.body.removeChild(container);

  const escapedTitle = escapeHtmlEntities(noteTitle);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapedTitle}</title>
  <style>
    body {
      /* Safe system font stack — Obsidian's custom fonts are not available
         in the isolated PDF BrowserWindow */
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui,
        "Segoe UI", Roboto, Inter, sans-serif;
      margin: 20px;
      padding: 0;
      max-width: 800px;
    }
    /* Hide any residual interactive Obsidian UI elements */
    .collapse-indicator, .list-collapse-indicator { display: none; }
    /* Keep SVG callout icons from overflowing their containers */
    svg { max-width: 1em; height: auto; vertical-align: middle; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

// ── Public: plain text conversion ────────────────────────────────────────────

/**
 * Strips markdown formatting from a string to produce clean plain text.
 * Used as the text/plain fallback part in the generated EML file.
 */
export function stripMarkdownToPlainText(markdownContent: string): string {
  return (
    markdownContent
      // Remove horizontal rules before inline formatting — *** would otherwise
      // be parsed as italic emphasis wrapping a single asterisk
      .replace(/^[-*]{3,}$/gm, '')
      // Remove heading markers, keep the heading text
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold markers, keep text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      // Remove italic markers, keep text
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // Remove strikethrough markers, keep text
      .replace(/~~(.+?)~~/g, '$1')
      // Remove inline code markers, keep text
      .replace(/`([^`]+)`/g, '$1')
      // Remove highlight markers, keep text
      .replace(/==(.+?)==/g, '$1')
      // Convert unordered list markers to a bullet character
      .replace(/^[-*+]\s+/gm, '\u2022 ')
      // Remove ordered list numbering, keep text
      .replace(/^\d+\.\s+/gm, '')
      // Remove blockquote markers, keep text
      .replace(/^>\s?/gm, '')
      // Remove fenced code block delimiters, keep code content
      .replace(/^```\w*$/gm, '')
      // Convert markdown links to their visible text
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .trim()
  );
}

// ── Internal: MIME helpers ────────────────────────────────────────────────────

/**
 * Wraps a base64 string at 76 characters per line as required by the MIME spec
 * (RFC 2045 §6.8).
 */
function wrapBase64AtLineLength(base64String: string): string {
  return (base64String.match(/.{1,76}/g) ?? [base64String]).join('\r\n');
}

// ── Public: EML document building ────────────────────────────────────────────

/**
 * Builds a MIME multipart/alternative EML string with a text/plain fallback
 * and a text/html primary part. Both parts are base64-encoded (UTF-8).
 *
 * The resulting string can be written to a `.eml` file and opened directly
 * by any standard email client (Outlook, Thunderbird, Windows Mail, etc.),
 * which will display the formatted HTML body pre-filled and ready to send.
 */
export function buildEmlContent(
  htmlContent: string,
  plainTextContent: string,
  subject: string,
): string {
  const encodedHtml = wrapBase64AtLineLength(
    Buffer.from(htmlContent, 'utf-8').toString('base64'),
  );
  const encodedPlainText = wrapBase64AtLineLength(
    Buffer.from(plainTextContent, 'utf-8').toString('base64'),
  );

  return [
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${EML_BOUNDARY}"`,
    '',
    `--${EML_BOUNDARY}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedPlainText,
    '',
    `--${EML_BOUNDARY}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedHtml,
    '',
    `--${EML_BOUNDARY}--`,
  ].join('\r\n');
}

// ── Public: EML with PDF attachment ──────────────────────────────────────────

/**
 * Builds a MIME multipart/mixed EML string with a generic plain-text body and a PDF
 * file attachment. The PDF is base64-encoded per RFC 2045 §6.8.
 *
 * The plain-text part gives email clients a readable fallback message while
 * the attached PDF carries the fully styled note content.
 */
export function buildEmlWithPdfAttachment(
  pdfBuffer: Buffer,
  subject: string,
  noteTitle: string,
): string {
  // Derive a safe file name by stripping characters that are unsafe in paths
  const safeFileName = noteTitle.replace(/[^\w\s-]/g, '').trim() + '.pdf';

  const encodedBody = wrapBase64AtLineLength(
    Buffer.from(EMAIL_BODY_TEXT, 'utf-8').toString('base64'),
  );
  const encodedPdf = wrapBase64AtLineLength(pdfBuffer.toString('base64'));

  return [
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    `Content-Type: multipart/mixed; boundary="${EML_BOUNDARY}"`,
    '',
    `--${EML_BOUNDARY}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedBody,
    '',
    `--${EML_BOUNDARY}`,
    `Content-Type: application/pdf; name="${safeFileName}"`,
    `Content-Disposition: attachment; filename="${safeFileName}"`,
    'Content-Transfer-Encoding: base64',
    '',
    encodedPdf,
    '',
    `--${EML_BOUNDARY}--`,
  ].join('\r\n');
}

// ── Public: Electron dependency factory ──────────────────────────────────────
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
      // Access the global Obsidian App instance — always available in the renderer process
      const obsidianApp = (window as unknown as { app: App }).app;
      const file = obsidianApp.workspace.getActiveFile();
      return buildObsidianHtml(obsidianApp, markdown, noteTitle, file);
    },

    writeEmlToTemp: (emlContent: string, noteTitle: string): string => {
      const os = require('os');
      const path = require('path');
      const fs = require('fs');
      // Replace characters that are unsafe in file names with a space
      const safeFileName = noteTitle.replace(/[^\w\s-]/g, '').trim() + '.eml';
      const filePath = path.join(os.tmpdir(), safeFileName);
      fs.writeFileSync(filePath, emlContent, 'utf-8');
      return filePath;
    },

    openEmlFile: async (filePath: string): Promise<void> => {
      // shell.openPath opens the file with the OS-registered default handler
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
      const fs = require('fs');
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore deletion errors — the OS temp directory will eventually reclaim the file
      }
    },
  };
}

// ── Public: orchestration ─────────────────────────────────────────────────────

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
  dependencies: SendNoteByEmailDependencies = createDefaultSendDependencies(),
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
