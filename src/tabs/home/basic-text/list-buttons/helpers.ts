import type { MinimalEditor } from './interfaces';

/**
 * Counts the number of leading tab characters in a line.
 * Obsidian's `editor:indent-list` inserts one tab per indent level,
 * so tab count equals logical indent depth.
 */
function countLeadingTabs(lineText: string): number {
  let tabCount = 0;

  for (const character of lineText) {
    if (character === '\t') tabCount++;
    else break;
  }

  return tabCount;
}

/**
 * Returns true when a line is a markdown list item (bullet, numbered, or todo).
 * Only list items provide valid parent-depth context for indent-safety checking.
 * Non-list lines (headers, paragraphs, etc.) do not count as list parents.
 */
function isListItemLine(lineText: string): boolean {
  // Matches optional leading tabs followed by a list marker:
  //   - bullet: `- `, `* `, `+ ` (with optional checkbox `[ ] `)
  //   - numbered: `1. `, `2. `, etc.
  return /^\t*([-*+]|\d+\.)\s/.test(lineText);
}

/**
 * Returns true when the current line can be safely indented one more level
 * without breaking the markdown list parser.
 *
 * Markdown/Obsidian requires each child list item to be indented at most
 * one level deeper than the item directly above it. Skipping levels causes
 * the parser to stop treating the line as a list item, hiding its bullet.
 */
export function canSafelyIndent(editor: MinimalEditor): boolean {
  const cursor = editor.getCursor();

  // First line in the document has no constraint from above
  if (cursor.line === 0) return true;

  const currentLine = editor.getLine(cursor.line);
  const currentDepth = countLeadingTabs(currentLine);

  // Walk upward to find the nearest non-empty line
  for (let lineIndex = cursor.line - 1; lineIndex >= 0; lineIndex--) {
    const previousLine = editor.getLine(lineIndex);

    if (previousLine.trim() === '') continue;

    // Only a list item can serve as a valid depth reference.
    // Headers, paragraphs, etc. do not establish list parent context, so
    // indenting past them would orphan the list item at an invalid depth.
    if (!isListItemLine(previousLine)) return false;

    const previousDepth = countLeadingTabs(previousLine);

    // Block indent when current line is already deeper than the previous line
    return currentDepth <= previousDepth;
  }

  // No non-empty previous line found — allow indent
  return true;
}
