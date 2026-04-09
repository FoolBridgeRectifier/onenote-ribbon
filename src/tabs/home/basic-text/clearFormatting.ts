/**
 * Strips inline (and optionally block-level) Markdown formatting from a string.
 * @param raw - The raw text to strip.
 * @param inline - When true, only strip inline markers; preserve headings.
 */
export function stripFormatting(raw: string, inline: boolean): string {
  let cleaned = raw
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .replace(/_(.*?)_/gs, "$1")
    .replace(/~~(.*?)~~/gs, "$1")
    .replace(/==(.*?)==/gs, "$1")
    .replace(/`(.*?)`/gs, "$1")
    .replace(/<\/?[^>]+(>|$)/g, "");
  if (!inline) cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");
  return cleaned;
}

/** Apply clearing to the active editor: selection if present, else current line. */
export function clearFormatting(editor: any, inline: boolean): void {
  const hasSel = !!editor.getSelection();
  const raw = hasSel
    ? editor.getSelection()
    : editor.getLine(editor.getCursor().line);
  const cleaned = stripFormatting(raw, inline);
  if (hasSel) editor.replaceSelection(cleaned);
  else editor.setLine(editor.getCursor().line, cleaned);
}
