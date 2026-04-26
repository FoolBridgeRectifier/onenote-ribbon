import type { HtmlTagDefinition } from '../interfaces';

/**
 * Builds an inline span {@link HtmlTagDefinition} for an arbitrary CSS property/value pair
 * (e.g. font-family, color, background, margin-left). Used by font-picker, highlight,
 * colour, align, and indent buttons. Mirrors the old engine's `buildSpanTagDefinition`
 * so callers do not have to change their code when migrating.
 */
export function buildSpanTagDefinition(cssProperty: string, cssValue: string): HtmlTagDefinition {
  return {
    tagName: 'span',
    domain: 'html',
    openingMarkup: `<span style="${cssProperty}:${cssValue}">`,
    closingMarkup: '</span>',
    attributes: { [cssProperty]: cssValue },
  };
}
