import type { ObsidianEditor } from '../../../../../shared/editor-v2/styling-engine/editor-integration/interfaces';
import {
  FONT_SIZE_IN_LINE_PATTERN,
  HEADING_PREFIX_PATTERN,
  LINE_HEIGHT_MULTIPLIER,
  LINE_HEIGHT_WRAPPER_PATTERN,
  MINIMUM_FONT_SIZE_FOR_LINE_HEIGHT_PT,
} from './constants';

/**
 * Computes the recommended line-height in points for a given font size.
 * Uses a 1.1× multiplier, ceiled to the nearest whole point.
 */
export function computeLineHeightForFontSize(sizeInPt: number): number {
  return Math.ceil(sizeInPt * LINE_HEIGHT_MULTIPLIER);
}

/**
 * Extracts all font-size point values found in the inline HTML of a line.
 * Returns an empty array when no font-size spans exist.
 */
export function extractFontSizesFromLine(lineContent: string): number[] {
  const fontSizes: number[] = [];

  // Use a fresh RegExp instance to avoid shared lastIndex state.
  const regex = new RegExp(FONT_SIZE_IN_LINE_PATTERN.source, 'g');
  let matchResult: RegExpExecArray | null;

  while ((matchResult = regex.exec(lineContent)) !== null) {
    fontSizes.push(parseFloat(matchResult[1]));
  }

  return fontSizes;
}

/**
 * Returns the maximum required line-height (pt) for font-size spans above the threshold
 * on the line, or null when no qualifying spans exist.
 * Font sizes at or below MINIMUM_FONT_SIZE_FOR_LINE_HEIGHT_PT are ignored because the
 * default editor line-height already accommodates them.
 */
export function computeMaxLineHeightForLine(lineContent: string): number | null {
  const fontSizes = extractFontSizesFromLine(lineContent);

  // Only consider font sizes that genuinely need a larger line-height than the default.
  const largeFontSizes = fontSizes.filter((size) => size > MINIMUM_FONT_SIZE_FOR_LINE_HEIGHT_PT);

  if (largeFontSizes.length === 0) return null;

  const maxFontSize = Math.max(...largeFontSizes);
  return computeLineHeightForFontSize(maxFontSize);
}

/**
 * Wraps the current cursor line in a line-height span sized to the largest
 * font-size span present on that line. Updates an existing wrapper when one
 * is already present. Does nothing when the line contains no font-size spans.
 * Heading prefixes (e.g., "## ") are kept outside the wrapper.
 */
export function applyLineHeightToLine(editor: ObsidianEditor): void {
  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);

  // Strip any existing line-height wrapper to work with the raw inner content.
  const existingWrapperMatch = lineContent.match(LINE_HEIGHT_WRAPPER_PATTERN);
  const strippedContent = existingWrapperMatch
    ? (existingWrapperMatch[1] ?? '') + existingWrapperMatch[3]
    : lineContent;

  const maxLineHeight = computeMaxLineHeightForLine(strippedContent);

  if (maxLineHeight === null) {
    // If an orphaned wrapper remains (e.g., user replaced a large font with a small one),
    // strip it so the default editor line-height takes over cleanly.
    if (existingWrapperMatch) {
      editor.setLine(cursor.line, strippedContent);
    }
    return;
  }

  // Keep heading prefix (e.g., "## ") outside the line-height span.
  const headingPrefixMatch = strippedContent.match(HEADING_PREFIX_PATTERN);
  const headingPrefix = headingPrefixMatch ? headingPrefixMatch[1] : '';
  const innerContent = headingPrefix
    ? strippedContent.slice(headingPrefix.length)
    : strippedContent;

  editor.setLine(
    cursor.line,
    `${headingPrefix}<span style="line-height: ${maxLineHeight}pt">${innerContent}</span>`
  );
}
