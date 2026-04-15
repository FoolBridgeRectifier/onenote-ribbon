/**
 * Minimal subset of the Obsidian Editor API used for indent-depth checking.
 * The real Obsidian Editor satisfies this via structural typing.
 */
interface MinimalEditor {
  getCursor(): { line: number; ch: number };
  getLine(lineNumber: number): string;
}

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
 * Returns true when the current line can be safely indented one more level
 * without breaking the markdown list parser.
 *
 * Markdown/Obsidian requires each child list item to be indented at most
 * one level deeper than the item directly above it. Skipping levels causes
 * the parser to stop treating the line as a list item, hiding its bullet.
 *
 * The check: if the cursor line is already deeper than the nearest
 * non-empty line above it, further indentation would create an invalid gap.
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

    const previousDepth = countLeadingTabs(previousLine);

    // Block indent when current line is already deeper than the previous line
    return currentDepth <= previousDepth;
  }

  // No non-empty previous line found — allow indent
  return true;
}
