import type { HtmlTagRange } from '../editor/enclosing-html-tags/enclosingHtmlTags';
import {
  extractStylePropertyFromOpeningTag,
  extractAllStyleProperties,
} from '../editor/styling-engine/tag-manipulation/style-parsing/StyleParsing';
import { VALID_TEXT_ALIGN_VALUES } from './constants';

/**
 * Extracts span/div-based state fields (fontColor, highlightColor, fontFamily, fontSize, textAlign)
 * from a list of enclosing tag ranges by inspecting their opening tag text.
 */
export function extractSpanAndDivState(
  enclosingTagRanges: HtmlTagRange[],
  sourceText: string,
  defaultFontFamily: string,
  defaultFontSize: string
): {
  fontColor: string | null;
  highlightColor: string | null;
  fontFamily: string;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
} {
  let fontColor: string | null = null;
  let highlightColor: string | null = null;
  let fontFamily = defaultFontFamily;
  let fontSize = defaultFontSize;
  let textAlign: 'left' | 'center' | 'right' | 'justify' = 'left';

  for (let rangeIndex = 0; rangeIndex < enclosingTagRanges.length; rangeIndex += 1) {
    const tagRange = enclosingTagRanges[rangeIndex];

    if (tagRange.tagName === 'span') {
      const openingTagText = sourceText.slice(
        tagRange.openingTagStartOffset,
        tagRange.openingTagEndOffset
      );
      const allProperties = extractAllStyleProperties(openingTagText);

      for (let propertyIndex = 0; propertyIndex < allProperties.length; propertyIndex += 1) {
        const styleProperty = allProperties[propertyIndex];

        if (styleProperty.propertyName === 'color') {
          fontColor = styleProperty.propertyValue;
        } else if (styleProperty.propertyName === 'background') {
          highlightColor = styleProperty.propertyValue;
        } else if (styleProperty.propertyName === 'font-family') {
          fontFamily = styleProperty.propertyValue.replace(/'/g, '');
        } else if (styleProperty.propertyName === 'font-size') {
          fontSize = styleProperty.propertyValue.replace('pt', '');
        } else if (styleProperty.propertyName === 'text-align') {
          if (VALID_TEXT_ALIGN_VALUES.has(styleProperty.propertyValue)) {
            textAlign = styleProperty.propertyValue as 'left' | 'center' | 'right' | 'justify';
          }
        }
      }

      // Legacy: detect text-align from <div> tags for backward compatibility
    } else if (tagRange.tagName === 'div') {
      const openingTagText = sourceText.slice(
        tagRange.openingTagStartOffset,
        tagRange.openingTagEndOffset
      );
      const styleProperty = extractStylePropertyFromOpeningTag(openingTagText);

      if (styleProperty && styleProperty.propertyName === 'text-align') {
        const alignValue = styleProperty.propertyValue;
        if (VALID_TEXT_ALIGN_VALUES.has(alignValue)) {
          textAlign = alignValue as 'left' | 'center' | 'right' | 'justify';
        }
      }
    }
  }

  return { fontColor, highlightColor, fontFamily, fontSize, textAlign };
}
