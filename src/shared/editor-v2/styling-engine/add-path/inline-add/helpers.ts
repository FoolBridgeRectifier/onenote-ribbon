import type { TagDefinition } from '../../interfaces';
import {
  MD_DELIMITER_FOR_TYPE,
  HTML_ELEMENT_FOR_TYPE,
  CSS_PROPERTY_FOR_SPAN_TYPE,
  DEFAULT_SPAN_VALUE,
} from '../../constants';

/** Returns true when the tag should render as a `<tag>...</tag>` HTML closing element. */
export function isHtmlClosingTag(tagDefinition: TagDefinition): boolean {
  return Boolean(tagDefinition.isHTML) && !tagDefinition.isSpan;
}

/** Returns true when the tag is a span-styled tag (color, fontSize, etc.). */
export function isSpanTag(tagDefinition: TagDefinition): boolean {
  return Boolean(tagDefinition.isSpan);
}

/** Returns true when the tag is plain markdown (no isHTML, no isSpan). */
export function isMarkdownTag(tagDefinition: TagDefinition): boolean {
  return !tagDefinition.isHTML && !tagDefinition.isSpan;
}

/** Returns the MD delimiter for `tagDefinition.type`, or null if there is none. */
export function getMdDelimiter(tagDefinition: TagDefinition): string | null {
  return MD_DELIMITER_FOR_TYPE[tagDefinition.type] ?? null;
}

/** Returns the HTML element name (`b`, `i`, `s`, `u`, `sub`, `sup`) for the tag, or null. */
export function getHtmlElementName(tagDefinition: TagDefinition): string | null {
  return HTML_ELEMENT_FOR_TYPE[tagDefinition.type] ?? null;
}

/** Returns the CSS property name for a span tag (e.g. `color`, `font-size`). */
export function getSpanCssProperty(tagDefinition: TagDefinition): string | null {
  return CSS_PROPERTY_FOR_SPAN_TYPE[tagDefinition.type] ?? null;
}

/** Returns the default value used when the caller does not provide a span value. */
export function getDefaultSpanValue(tagDefinition: TagDefinition): string {
  return DEFAULT_SPAN_VALUE[tagDefinition.type] ?? '';
}

/** Builds the opening `<span style="...">` markup for a span tag of the given type. */
export function buildSpanOpener(tagDefinition: TagDefinition): string {
  const property = getSpanCssProperty(tagDefinition);
  // Caller-supplied value (from adapter / custom span) overrides the type's default value.
  const value = tagDefinition.spanValue ?? getDefaultSpanValue(tagDefinition);
  return `<span style="${property}:${value}">`;
}
