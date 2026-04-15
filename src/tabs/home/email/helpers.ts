import { Notice } from 'obsidian';

import {
  EMAIL_SUBJECT_PREFIX,
  EML_BOUNDARY,
  NOTE_EXPORT_STYLES,
} from './constants';
import type { SendNoteByEmailDependencies } from './interfaces';

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
 *
 * When `preRenderedBody` is provided (e.g. HTML taken directly from Obsidian's
 * reading mode), it is used as the body verbatim — the markdown-to-HTML
 * conversion is skipped and no extra `<h1>` title is injected (the reading
 * mode HTML already contains the rendered title).
 */
export function buildNoteHtml(
  markdownContent: string,
  noteTitle: string,
  preRenderedBody?: string,
): string {
  const escapedTitle = escapeHtmlEntities(noteTitle);
  const bodyHtml =
    preRenderedBody !== undefined
      ? preRenderedBody
      : `<h1>${escapedTitle}</h1>\n  ${convertMarkdownToHtmlBody(markdownContent)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapedTitle}</title>
  <style>${NOTE_EXPORT_STYLES}</style>
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
  };
}

// ── Public: orchestration ─────────────────────────────────────────────────────

/**
 * Converts the given markdown to a styled EML file (HTML email body + plain
 * text fallback), writes it to the OS temp directory, and opens it with the
 * system default email client so the user can add recipients and send.
 *
 * When `preRenderedHtml` is provided (e.g. the innerHTML captured from
 * Obsidian's reading-mode view), it is used as the HTML body directly instead
 * of running the custom markdown-to-HTML converter. The `markdownContent` is
 * still used to produce the plain-text fallback part of the email.
 *
 * The `dependencies` parameter allows injecting mocks in tests. When omitted,
 * the real Electron implementations are used.
 */
export async function sendNoteByEmail(
  markdownContent: string,
  noteTitle: string,
  dependencies: SendNoteByEmailDependencies = createDefaultSendDependencies(),
  preRenderedHtml?: string,
): Promise<void> {
  const htmlContent = buildNoteHtml(markdownContent, noteTitle, preRenderedHtml);
  const plainTextContent = stripMarkdownToPlainText(markdownContent);
  const subject = EMAIL_SUBJECT_PREFIX + noteTitle;

  const emlContent = buildEmlContent(htmlContent, plainTextContent, subject);
  const savedEmlPath = dependencies.writeEmlToTemp(emlContent, noteTitle);

  await dependencies.openEmlFile(savedEmlPath);
  dependencies.displayNotice('Opening your email client...');
}
