import type { LinePrefixResult } from '../interfaces';
import {
  CALLOUT_HEADER_PATTERN,
  MEETING_DETAILS_OPENING_PATTERN,
  CHECKBOX_ITEM_PATTERN,
  LIST_ITEM_PATTERN,
  HEADING_LINE_PATTERN,
  QUOTE_LINE_PATTERN,
  INDENT_SPAN_PATTERN,
} from '../constants';

/**
 * Inspects a single line and returns the line-level prefix tag (if any) plus
 * the column at which inline content begins. Recognises (priority order):
 * meetingDetails, callout, checkbox, list, heading, quote, indent.
 */
export function detectLinePrefix(line: string, lineIndex: number): LinePrefixResult {
  // Meeting-details opening line (`> ---`) — page-level marker, no open/close offsets.
  if (MEETING_DETAILS_OPENING_PATTERN.test(line)) {
    return { tag: { type: 'meetingDetails' }, contentStartCh: line.length };
  }

  // Callout header `> [!type] title` — open spans the `> ` prefix only.
  const calloutMatch = CALLOUT_HEADER_PATTERN.exec(line);
  if (calloutMatch) {
    const prefixEnd = calloutMatch[1].length + 1; // `>` chars + the space after
    return {
      tag: {
        type: 'callout',
        open: { start: { line: lineIndex, ch: 0 }, end: { line: lineIndex, ch: prefixEnd } },
      },
      contentStartCh: prefixEnd,
    };
  }

  // Checkbox: `- [ ] ` (six characters wide, including the trailing space).
  if (CHECKBOX_ITEM_PATTERN.test(line)) {
    return {
      tag: {
        type: 'checkbox',
        open: { start: { line: lineIndex, ch: 0 }, end: { line: lineIndex, ch: 6 } },
      },
      contentStartCh: 6,
    };
  }

  // Plain list item: `- ` (two characters).
  if (LIST_ITEM_PATTERN.test(line)) {
    return {
      tag: {
        type: 'list',
        open: { start: { line: lineIndex, ch: 0 }, end: { line: lineIndex, ch: 2 } },
      },
      contentStartCh: 2,
    };
  }

  // Heading: `#` repeated 1–6 times, then a single space.
  const headingMatch = HEADING_LINE_PATTERN.exec(line);
  if (headingMatch) {
    const prefixEnd = headingMatch[1].length + 1;
    return {
      tag: {
        type: 'heading',
        open: { start: { line: lineIndex, ch: 0 }, end: { line: lineIndex, ch: prefixEnd } },
      },
      contentStartCh: prefixEnd,
    };
  }

  // Plain quote: `> ` (two characters) — but never a callout (`> [!`).
  if (QUOTE_LINE_PATTERN.test(line)) {
    return {
      tag: {
        type: 'quote',
        open: { start: { line: lineIndex, ch: 0 }, end: { line: lineIndex, ch: 2 } },
      },
      contentStartCh: 2,
    };
  }

  // Margin-left indent span at the start of the line — span occupies its own width.
  const indentMatch = INDENT_SPAN_PATTERN.exec(line);
  if (indentMatch && indentMatch.index === 0) {
    const prefixEnd = indentMatch[0].length;
    return {
      tag: {
        type: 'indent',
        open: { start: { line: lineIndex, ch: 0 }, end: { line: lineIndex, ch: prefixEnd } },
      },
      contentStartCh: prefixEnd,
    };
  }

  return { tag: null, contentStartCh: 0 };
}
