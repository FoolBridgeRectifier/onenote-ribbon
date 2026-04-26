import type { TagDefinition } from '../../../interfaces';
import type { HtmlTagDefinition } from '../../interfaces';
import { TYPE_TO_CSS_PROPERTY, TYPE_TO_HTML_ELEMENT, TYPE_TO_MD_DELIMITER } from './constants';

/**
 * Translates an array of v2 {@link TagDefinition}s back into the legacy
 * {@link HtmlTagDefinition} shape consumed by the format-painter / paste flow.
 * The mapping is the inverse of `translateHtmlTagDefinitionToV2`.
 */
export function translateV2ToHtml(tagDefinitions: TagDefinition[]): HtmlTagDefinition[] {
  return tagDefinitions.map(translateOne);
}

/** Translates a single v2 TagDefinition into the legacy HtmlTagDefinition shape. */
function translateOne(tagDefinition: TagDefinition): HtmlTagDefinition {
  // Span tag: re-derive the CSS property + value pair.
  if (tagDefinition.isSpan) {
    const cssProperty = TYPE_TO_CSS_PROPERTY[tagDefinition.type] ?? 'color';
    const cssValue = tagDefinition.spanValue ?? '';
    return {
      tagName: 'span',
      domain: 'html',
      openingMarkup: `<span style="${cssProperty}:${cssValue}">`,
      closingMarkup: '</span>',
      attributes: { [cssProperty]: cssValue },
    };
  }

  // HTML element shorthand → legacy single-letter element.
  if (tagDefinition.isHTML) {
    const elementName = TYPE_TO_HTML_ELEMENT[tagDefinition.type] ?? tagDefinition.type;
    return {
      tagName: elementName,
      domain: 'html',
      openingMarkup: `<${elementName}>`,
      closingMarkup: `</${elementName}>`,
    };
  }

  // Plain MD tag → legacy markdown form.
  const delimiter = TYPE_TO_MD_DELIMITER[tagDefinition.type] ?? '';
  return {
    tagName: tagDefinition.type,
    domain: 'markdown',
    openingMarkup: delimiter,
    closingMarkup: delimiter,
  };
}
