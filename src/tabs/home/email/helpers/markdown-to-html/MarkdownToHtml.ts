import { NOTE_EXPORT_STYLES } from '../../constants';
import {
  escapeHtmlEntities,
  convertMarkdownToHtmlBody,
} from '../markdown-converter/MarkdownConverter';

/**
 * Builds a complete, self-contained HTML document from markdown content.
 * The document includes print-friendly styles matching markdown conventions.
 */
export function buildNoteHtml(markdownContent: string, noteTitle: string): string {
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
