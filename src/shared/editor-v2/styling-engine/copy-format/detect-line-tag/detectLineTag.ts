import type { TagDefinition } from '../../interfaces';

/**
 * Returns the line-level TagDefinition for the given line, or undefined for plain content.
 * Used by copyFormat to capture the line-tag at the cursor.
 */
export function detectLineTag(lineText: string): TagDefinition | undefined {
  if (/^- \[ ?\] /.test(lineText))      return { type: 'checkbox' };
  if (/^>\s*\[!\w+\]/.test(lineText))   return { type: 'callout' };
  if (/^#{1,6}\s/.test(lineText))       return { type: 'heading' };
  if (/^- (?!\[ ?\])/.test(lineText))   return { type: 'list' };
  if (/^>\s/.test(lineText))            return { type: 'quote' };
  if (/^#todo /.test(lineText))         return { type: 'inlineTodo' };
  return undefined;
}
