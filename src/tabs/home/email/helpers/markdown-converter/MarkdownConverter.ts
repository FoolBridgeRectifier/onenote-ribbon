import { escapeHtmlEntities, convertInlineMarkdown } from './helpers';
export { escapeHtmlEntities } from './helpers';

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
      outputLines.push(`<li>${convertInlineMarkdown(unorderedListMatch[1])}</li>`);
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
      outputLines.push(`<li>${convertInlineMarkdown(orderedListMatch[1])}</li>`);
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
