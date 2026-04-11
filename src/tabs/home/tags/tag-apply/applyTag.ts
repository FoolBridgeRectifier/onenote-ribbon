import { toggleLinePrefix } from '../../../../shared/toggleLinePrefix';

/**
 * Applies or toggles a tag on the current line.
 * Tags are line prefixes that can be toggled on/off.
 */
export function applyTag(
  tagId: string,
  editor: {
    getLine(n: number): string;
    setLine(n: number, text: string): void;
    getCursor(): { line: number; ch: number };
  }
): void {
  const tagPrefixes: Record<string, string> = {
    'tag-todo': '- [ ] ',
    'tag-important': '- [ ] 🔴 ',
    'tag-urgent': '- [ ] 🟡 ',
  };

  const prefix = tagPrefixes[tagId];
  if (!prefix) {
    console.warn(`Unknown tag: ${tagId}`);
    return;
  }

  toggleLinePrefix(editor, prefix);
}
