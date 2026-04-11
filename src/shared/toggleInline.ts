/**
 * Toggles inline formatting (bold, italic, underline, strikethrough, highlight).
 * - If selection is wrapped: unwraps it
 * - If no selection: inserts empty pair
 * - Otherwise: wraps selection
 *
 * Special case: prevents treating `**` as matching `*` (italics).
 */
export function toggleInline(
  editor: {
    getSelection(): string;
    setSelection(from: { line: number; ch: number }, to: { line: number; ch: number }): void;
    replaceSelection(text: string): void;
    getCursor(): { line: number; ch: number };
    getLine(n: number): string;
  },
  open: string,
  close?: string
): void {
  const openTag = open;
  const closeTag = close ?? open;

  const selection = editor.getSelection();
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  if (!selection) {
    // No selection — insert empty pair
    editor.replaceSelection(openTag + closeTag);
    // Move cursor between tags
    const newCh = cursor.ch + openTag.length;
    editor.setSelection({ line: cursor.line, ch: newCh }, { line: cursor.line, ch: newCh });
    return;
  }

  // Check if selection is already wrapped
  const lineStart = line.indexOf(selection);
  if (lineStart !== -1) {
    const before = line.substring(lineStart - openTag.length, lineStart);
    const after = line.substring(lineStart + selection.length, lineStart + selection.length + closeTag.length);

    if (before === openTag && after === closeTag) {
      // Selection is wrapped — unwrap it
      // But guard against treating ** as matching * for italic
      // Check if the character after the opening tag is the same as the opening tag
      // This prevents * from treating **text** as italic
      if (openTag.length === 1 && selection[openTag.length] === openTag[0]) {
        // This looks like bold (**) being checked by italic (*)
        // Don't unwrap — wrap again instead
        editor.replaceSelection(openTag + selection + closeTag);
        return;
      }

      // Safe to unwrap
      editor.replaceSelection(selection);
      return;
    }
  }

  // Default: wrap the selection
  editor.replaceSelection(openTag + selection + closeTag);
}
