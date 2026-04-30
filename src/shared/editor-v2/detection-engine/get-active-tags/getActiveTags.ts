import type { TRawTagDetection } from '../interfaces';
import {
  MD_TAG_REGEX,
  HTML_EQUIV_MD_TAG_REGEX,
  HTML_TAG_REGEX,
  SPAN_TAG_REGEX,
  LINE_TAG_REGEX,
  SPECIAL_TAG_REGEX,
} from '../tag-regex/tagRegex';

/** Returns non-empty regex matches for `pattern` across the entire `content` string. */
function findAllMatches(pattern: RegExp, content: string): RegExpMatchArray[] {
  const globalPattern = new RegExp(
    pattern.source,
    pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  );
  return [...content.matchAll(globalPattern)].filter((match) => match[0].length > 0);
}

function getLineAtIndex(content: string, index: number): string {
  const lineStartIndex = content.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
  const nextLineBreakIndex = content.indexOf('\n', index);
  const lineEndIndex = nextLineBreakIndex === -1 ? content.length : nextLineBreakIndex;

  return content.slice(lineStartIndex, lineEndIndex);
}

function getLineNumberAtIndex(content: string, index: number): number {
  const contentBeforeIndex = content.slice(0, index);
  return contentBeforeIndex.split('\n').length;
}

function getColumnNumberAtIndex(content: string, index: number): number {
  const lineStartIndex = content.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
  return index - lineStartIndex + 1;
}

function buildRawTagDetection(
  content: string,
  detectionSeed: Pick<TRawTagDetection, 'type' | 'role' | 'index' | 'match'>
): TRawTagDetection {
  const { type, role, index, match } = detectionSeed;

  return {
    type,
    role,
    index,
    match,
    line: getLineAtIndex(content, index),
    location: {
      index,
      lineNumber: getLineNumberAtIndex(content, index),
      columnNumber: getColumnNumberAtIndex(content, index),
    },
  };
}

export function getActiveTags(content: string, _cursor: unknown): TRawTagDetection[] {
  const detections: Array<Pick<TRawTagDetection, 'type' | 'role' | 'index' | 'match'>> = [];

  // MD delimiter-based: bold (**), strikethrough (~~), highlight (==), italic (*)
  for (const { type, delimiter } of MD_TAG_REGEX) {
    for (const match of findAllMatches(delimiter, content)) {
      detections.push({ type, role: 'delimiter', index: match.index ?? 0, match: match[0] });
    }
  }

  // HTML equivalents of MD tags: <b>, <i>, <s>
  for (const { type, open, close } of HTML_EQUIV_MD_TAG_REGEX) {
    for (const match of findAllMatches(open, content)) {
      detections.push({ type, role: 'open', index: match.index ?? 0, match: match[0] });
    }
    for (const match of findAllMatches(close, content)) {
      detections.push({ type, role: 'close', index: match.index ?? 0, match: match[0] });
    }
  }

  // HTML-only tags: <u>, <sub>, <sup>
  for (const { type, open, close } of HTML_TAG_REGEX) {
    for (const match of findAllMatches(open, content)) {
      detections.push({ type, role: 'open', index: match.index ?? 0, match: match[0] });
    }
    for (const match of findAllMatches(close, content)) {
      detections.push({ type, role: 'close', index: match.index ?? 0, match: match[0] });
    }
  }

  // Span style tags: color, font-size, font-family, highlight, align
  for (const { type, open, close } of SPAN_TAG_REGEX) {
    for (const match of findAllMatches(open, content)) {
      detections.push({ type, role: 'open', index: match.index ?? 0, match: match[0] });
    }
    for (const match of findAllMatches(close, content)) {
      detections.push({ type, role: 'close', index: match.index ?? 0, match: match[0] });
    }
  }

  // Line prefix tags: callout, checkbox, list, heading, quote, indent
  for (const { type, open } of LINE_TAG_REGEX) {
    for (const match of findAllMatches(open, content)) {
      detections.push({ type, role: 'open', index: match.index ?? 0, match: match[0] });
    }
  }

  // Special tags: code, inline_todo, meeting_details, wikilink, embed, external_link, footnote_ref
  for (const { type, open, close } of SPECIAL_TAG_REGEX) {
    for (const match of findAllMatches(open, content)) {
      detections.push({ type, role: 'open', index: match.index ?? 0, match: match[0] });
    }

    if (close !== null && close !== undefined) {
      for (const match of findAllMatches(close, content)) {
        detections.push({ type, role: 'close', index: match.index ?? 0, match: match[0] });
      }
    }
  }

  return detections.map((detectionSeed) => buildRawTagDetection(content, detectionSeed));
}
