import type { DetectedTag } from '../editor-v2/detection-engine/interfaces';
import type { TextIndex } from '../editor/text-offset/interfaces';
import { positionToOffset } from '../editor/text-offset/TextOffset';
import { extractAllStyleProperties } from '../editor-v2/styling-engine/editor-integration/style-parsing/styleParsing';
import { LEGACY_DIV_ALIGN_PATTERN, VALID_TEXT_ALIGN_VALUES } from './constants';
import type { SpanAndDivState } from './interfaces';

export type { SpanAndDivState };

/**
 * Slices the raw opening-tag text for a detected tag from the source.
 * Opening tags are single-line; we convert their {line, ch} positions to
 * flat offsets through the shared text index for an O(1) slice.
 */
function sliceOpeningTagText(
  detectedTag: DetectedTag,
  sourceText: string,
  textIndex: TextIndex
): string | null {
  if (!detectedTag.open) return null;

  const openingStartOffset = positionToOffset(
    { line: detectedTag.open.start.line, ch: detectedTag.open.start.ch },
    textIndex
  );
  const openingEndOffset = positionToOffset(
    { line: detectedTag.open.end.line, ch: detectedTag.open.end.ch },
    textIndex
  );

  return sourceText.slice(openingStartOffset, openingEndOffset);
}

/**
 * Extracts span/div-based state fields (fontColor, highlightColor, fontFamily, fontSize, textAlign)
 * from the detection engine's enclosing tag list by inspecting the raw opening-tag text.
 *
 * Span detection comes from the detection engine (DetectedTag.isSpan === true).
 * Legacy `<div style="text-align:...">` wrappers are detected via a per-line scan because the
 * detection engine intentionally does not pair `<div>` tags.
 */
export function extractSpanAndDivState(
  enclosingTags: DetectedTag[],
  sourceText: string,
  textIndex: TextIndex,
  cursorLineContent: string,
  defaultFontFamily: string,
  defaultFontSize: string
): SpanAndDivState {
  let fontColor: string | null = null;
  let highlightColor: string | null = null;
  let fontFamily = defaultFontFamily;
  let fontSize = defaultFontSize;
  let textAlign: 'left' | 'center' | 'right' | 'justify' = 'left';

  for (let tagIndex = 0; tagIndex < enclosingTags.length; tagIndex += 1) {
    const detectedTag = enclosingTags[tagIndex];

    // Only HTML spans carry the css-based styling state we read here.
    if (!detectedTag.isSpan) continue;

    const openingTagText = sliceOpeningTagText(detectedTag, sourceText, textIndex);
    if (openingTagText === null) continue;

    const allProperties = extractAllStyleProperties(openingTagText);

    for (let propertyIndex = 0; propertyIndex < allProperties.length; propertyIndex += 1) {
      const styleProperty = allProperties[propertyIndex];

      if (styleProperty.propertyName === 'color') {
        fontColor = styleProperty.propertyValue;
      } else if (styleProperty.propertyName === 'background') {
        highlightColor = styleProperty.propertyValue;
      } else if (styleProperty.propertyName === 'font-family') {
        // Strip surrounding single quotes that some font names carry.
        fontFamily = styleProperty.propertyValue.replace(/'/g, '');
      } else if (styleProperty.propertyName === 'font-size') {
        fontSize = styleProperty.propertyValue.replace('pt', '');
      } else if (styleProperty.propertyName === 'text-align') {
        if (VALID_TEXT_ALIGN_VALUES.has(styleProperty.propertyValue)) {
          textAlign = styleProperty.propertyValue as SpanAndDivState['textAlign'];
        }
      }
    }
  }

  // Legacy: detect `<div style="text-align:VALUE">` wrappers on the cursor line.
  // The detection engine doesn't pair <div> tags; a per-line scan preserves
  // backward compatibility with content created by older plugin versions.
  const legacyDivMatch = cursorLineContent.match(LEGACY_DIV_ALIGN_PATTERN);
  if (legacyDivMatch) {
    const legacyAlignValue = legacyDivMatch[1];
    if (VALID_TEXT_ALIGN_VALUES.has(legacyAlignValue)) {
      textAlign = legacyAlignValue as SpanAndDivState['textAlign'];
    }
  }

  return { fontColor, highlightColor, fontFamily, fontSize, textAlign };
}
