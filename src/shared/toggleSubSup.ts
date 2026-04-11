/**
 * Toggles subscript (<sub>) or superscript (<sup>) tags.
 * - If cursor is inside a sub/sup tag: unwraps it (or converts to the other type)
 * - If selection: wraps in the specified tag
 * - Otherwise: inserts empty tag pair at cursor
 */
export function toggleSubSup(
  editor: {
    getLine(n: number): string;
    setLine(n: number, text: string): void;
    getCursor(): { line: number; ch: number };
    getSelection(): string;
    setSelection(from: { line: number; ch: number }, to: { line: number; ch: number }): void;
    replaceSelection(text: string): void;
  },
  type: 'sub' | 'sup'
): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const ch = cursor.ch;

  const openTag = `<${type}>`;
  const closeTag = `</${type}>`;
  const otherType = type === 'sub' ? 'sup' : 'sub';
  const otherOpenTag = `<${otherType}>`;
  const otherCloseTag = `</${otherType}>`;

  // Try to find if cursor is inside a sub/sup tag
  const openIdx = line.lastIndexOf(openTag, ch);
  const closeIdx = line.indexOf(closeTag, ch);
  const otherOpenIdx = line.lastIndexOf(otherOpenTag, ch);
  const otherCloseIdx = line.indexOf(otherCloseTag, ch);

  const inThisType = openIdx !== -1 && closeIdx !== -1 && openIdx < ch && ch <= closeIdx;
  const inOtherType = otherOpenIdx !== -1 && otherCloseIdx !== -1 && otherOpenIdx < ch && ch <= otherCloseIdx;

  if (inThisType) {
    // Toggle off: remove the tags
    const content = line.substring(openIdx + openTag.length, closeIdx);
    const newLine = line.substring(0, openIdx) + content + line.substring(closeIdx + closeTag.length);
    editor.setLine(cursor.line, newLine);
  } else if (inOtherType) {
    // Convert to the other type
    const content = line.substring(otherOpenIdx + otherOpenTag.length, otherCloseIdx);
    const newLine =
      line.substring(0, otherOpenIdx) +
      openTag +
      content +
      closeTag +
      line.substring(otherCloseIdx + otherCloseTag.length);
    editor.setLine(cursor.line, newLine);
  } else {
    // Not in any span — check for selection or insert empty pair
    const selection = editor.getSelection();
    if (selection) {
      // Wrap selection
      editor.replaceSelection(openTag + selection + closeTag);
    } else {
      // Insert empty pair at cursor
      editor.replaceSelection(openTag + closeTag);
      // Move cursor inside the tags
      const newCh = ch + openTag.length;
      editor.setSelection({ line: cursor.line, ch: newCh }, { line: cursor.line, ch: newCh });
    }
  }
}
