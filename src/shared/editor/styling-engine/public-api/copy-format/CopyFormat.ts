import type { TagDefinition, CopiedFormat } from '../../interfaces';
import type { HtmlTagRange } from '../../../enclosing-html-tags/interfaces';
import { HTML_TAG_NAME_DEFINITIONS, MARKDOWN_TAG_NAME_DEFINITIONS } from '../../constants';
import { buildTagRanges } from '../../../enclosing-html-tags/enclosingHtmlTags';
import { buildSpanTagDefinition } from '../../tag-manipulation/TagManipulation';
import { extractStylePropertyFromOpeningTag } from '../../tag-manipulation/style-parsing/StyleParsing';
import { detectFormattingDomain } from '../../domain-detection/DomainDetection';
import { findAllEnclosingTags } from '../../shared-helpers/tag-geometry/TagGeometry';

/**
 * Converts a tag range to a TagDefinition by looking up in the known tag definitions.
 * For span tags with inline styles, builds a dynamic span definition from the style property.
 * Returns null if the tag is unknown or cannot be represented as a TagDefinition.
 */
function tagRangeToTagDefinition(tagRange: HtmlTagRange, sourceText: string): TagDefinition | null {
  const htmlDefinition = HTML_TAG_NAME_DEFINITIONS.get(tagRange.tagName);
  if (htmlDefinition) return htmlDefinition;

  const markdownDefinition = MARKDOWN_TAG_NAME_DEFINITIONS.get(tagRange.tagName);
  if (markdownDefinition) return markdownDefinition;

  // Handle span tags with inline style attributes
  if (tagRange.tagName === 'span') {
    const styleProperty = extractStylePropertyFromOpeningTag(
      sourceText.slice(tagRange.openingTagStartOffset, tagRange.openingTagEndOffset)
    );
    if (styleProperty !== null) {
      return buildSpanTagDefinition(styleProperty.propertyName, styleProperty.propertyValue);
    }
  }

  return null;
}

/**
 * Returns all formatting tag definitions that enclose the selection, representing
 * the active formatting state. Used for copy-format functionality.
 */
export function copyFormat(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number
): CopiedFormat {
  const allTagRanges = buildTagRanges(sourceText);
  const enclosingRanges = findAllEnclosingTags(
    allTagRanges,
    selectionStartOffset,
    selectionEndOffset
  );
  const domain = detectFormattingDomain(
    sourceText,
    selectionStartOffset,
    selectionEndOffset
  ).domain;

  const tagDefinitions: TagDefinition[] = [];

  for (const tagRange of enclosingRanges) {
    const tagDefinition = tagRangeToTagDefinition(tagRange, sourceText);
    if (tagDefinition !== null) tagDefinitions.push(tagDefinition);
  }

  return { tagDefinitions, domain };
}
