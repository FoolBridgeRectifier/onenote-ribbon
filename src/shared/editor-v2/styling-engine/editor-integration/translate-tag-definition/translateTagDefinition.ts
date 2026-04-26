import type { TagDefinition } from '../../interfaces';
import type { HtmlTagDefinition } from '../interfaces';

/**
 * Translates the legacy {@link HtmlTagDefinition} (old engine shape) into the v2
 * {@link TagDefinition} consumed by `toggleTag` / `addTag` / `removeTag`.
 *
 * Mapping:
 *   - HTML elements (b, i, s, u, sub, sup) with domain='html' → `{ type, isHTML: true }`.
 *   - Markdown words (bold/italic/strikethrough/highlight) with domain='markdown' → `{ type }` only.
 *   - <span> with `attributes` → `{ type, isSpan: true, spanValue }` keyed by the CSS property.
 */
export function translateHtmlTagDefinitionToV2(
  htmlTagDefinition: HtmlTagDefinition,
): TagDefinition {
  const { tagName, domain, attributes } = htmlTagDefinition;

  // Span tag: derive type from CSS property name.
  if (tagName === 'span') {
    const cssEntries = attributes ? Object.entries(attributes) : [];
    if (cssEntries.length === 0) return { type: 'highlight', isSpan: true };
    const [cssProperty, cssValue] = cssEntries[0] as [string, string];
    return { type: mapCssPropertyToType(cssProperty), isSpan: true, spanValue: cssValue };
  }

  // HTML element shorthand → v2 type with isHTML.
  const htmlElementMap: Record<string, TagDefinition['type']> = {
    b:   'bold',
    i:   'italic',
    s:   'strikethrough',
    u:   'underline',
    sub: 'subscript',
    sup: 'superscript',
  };
  if (domain === 'html' && htmlElementMap[tagName]) {
    return { type: htmlElementMap[tagName], isHTML: true };
  }

  // Markdown words → v2 plain MD tag.
  const markdownTypeMap: Record<string, TagDefinition['type']> = {
    bold:          'bold',
    italic:        'italic',
    strikethrough: 'strikethrough',
    highlight:     'highlight',
    code:          'code',
  };
  if (markdownTypeMap[tagName]) return { type: markdownTypeMap[tagName] };

  // Fallback: best-effort treat as MD with literal type name.
  return { type: tagName as TagDefinition['type'] };
}

/** Maps a CSS property (color/background/font-family/...) to its v2 TagDefinition type. */
function mapCssPropertyToType(cssProperty: string): TagDefinition['type'] {
  const propertyToType: Record<string, TagDefinition['type']> = {
    'color':       'color',
    'background':  'highlight',
    'font-size':   'fontSize',
    'font-family': 'fontFamily',
    'text-align':  'align',
    'margin-left': 'indent',
  };
  return propertyToType[cssProperty] ?? 'color';
}
