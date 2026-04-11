/**
 * Toggles line prefix (bullet, numbered, heading, checkbox, etc.).
 * Strips any existing prefix (heading, bullet, numbered, checkbox, quote) and either:
 * - Adds the new prefix if line didn't have it
 * - Removes all prefixes if line already had this prefix
 */
export function toggleLinePrefix(
  editor: {
    getLine(n: number): string;
    setLine(n: number, text: string): void;
    getCursor(): { line: number; ch: number };
  },
  prefix: string
): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  // Regex to match any line prefix (heading, bullet, numbered, checklist, quote)
  const stripRegex = /^(#{1,6} |- \[[ x✔]\] (?:🔴 |🟡 )?|- |\d+\. |> \[![^\]]+\]\n> )/;

  // Check if line starts with this exact prefix
  const hasPrefix = line.startsWith(prefix);

  if (hasPrefix) {
    // Remove the prefix
    const stripped = line.substring(prefix.length);
    editor.setLine(cursor.line, stripped);
  } else {
    // Strip any existing prefix, then add the new one
    const stripped = line.replace(stripRegex, '');
    editor.setLine(cursor.line, prefix + stripped);
  }
}
