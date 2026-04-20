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
