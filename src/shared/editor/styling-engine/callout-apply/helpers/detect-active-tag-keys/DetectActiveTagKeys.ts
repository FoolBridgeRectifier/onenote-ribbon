import type { Editor } from 'obsidian';

import {
  ACTIVE_TAG_KEY_HIGHLIGHT,
  ACTIVE_TAG_KEY_TASK,
  TASK_LINE_PATTERN,
  HIGHLIGHT_PATTERN,
  CALLOUT_HEADER_WITH_TITLE_PATTERN,
  TASK_PREFIX_PATTERN,
} from '../../constants';
import { countBlockquoteDepth } from '../count-blockquote-depth/helpers';

/**
 * Detects which OneNote-style tag types are currently active at the editor cursor.
 * Returns a Set of active tag keys (task, highlight, and ALL enclosing callout titles/types).
 */
export function detectActiveTagKeys(editor: Editor | null): Set<string> {
  const activeKeys = new Set<string>();

  if (!editor) return activeKeys;

  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  // Strip one leading "> " so task and highlight patterns work inside callout blocks
  const lineContent = currentLine.replace(/^>\s?/, '');

  if (TASK_LINE_PATTERN.test(lineContent)) {
    activeKeys.add(ACTIVE_TAG_KEY_TASK);

    const prefixMatch = lineContent.match(TASK_PREFIX_PATTERN);
    if (prefixMatch) {
      activeKeys.add(`task-prefix:${prefixMatch[1].trim()}`);
    }
  }

  if (HIGHLIGHT_PATTERN.test(lineContent)) {
    activeKeys.add(ACTIVE_TAG_KEY_HIGHLIGHT);
  }

  if (!currentLine.startsWith('>')) return activeKeys;

  // Scan upward from cursor, collecting every enclosing callout header at decreasing depths.
  // Each time a shallower header is found, it is an outer parent callout — add it too.
  let previouslyFoundDepth = Infinity;

  for (let lineIndex = cursor.line; lineIndex >= 0; lineIndex -= 1) {
    const lineText = editor.getLine(lineIndex);

    // Stop scanning once we leave the blockquote region entirely
    if (!lineText.startsWith('>')) break;

    const calloutHeaderMatch = lineText.match(CALLOUT_HEADER_WITH_TITLE_PATTERN);
    if (!calloutHeaderMatch) continue;

    const headerDepth = countBlockquoteDepth(lineText);

    // Skip headers at the same depth or deeper — they are siblings or inner children
    if (headerDepth >= previouslyFoundDepth) continue;

    const calloutType = calloutHeaderMatch[2].toLowerCase();
    const rawTitle = calloutHeaderMatch[3]?.trim();

    // Strip HTML tags (e.g. <u><b>Important</b></u> → "Important") so that the
    // active key matches the plain-text title used by handler comparisons like
    // activeTagKeys.has('Important').
    const calloutTitle = rawTitle ? rawTitle.replace(/<[^>]+>/g, '').trim() : undefined;

    activeKeys.add(calloutTitle ?? calloutType);
    previouslyFoundDepth = headerDepth;
  }

  return activeKeys;
}
