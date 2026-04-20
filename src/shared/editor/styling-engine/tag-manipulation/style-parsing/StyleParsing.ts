import { STYLE_ATTRIBUTE_REGEX, STYLE_PROPERTY_VALUE_REGEX } from '../constants';

// ============================================================
// Opening Tag Parsing
// ============================================================

/**
 * Extracts the CSS property name and value from a span's opening tag.
 * Returns null if the tag has no style attribute or cannot be parsed.
 * Only returns the first property — use extractAllStyleProperties for
 * multi-property style attributes.
 */
export function extractStylePropertyFromOpeningTag(
  openingTagText: string
): { propertyName: string; propertyValue: string } | null {
  const styleMatch = openingTagText.match(STYLE_ATTRIBUTE_REGEX);

  if (!styleMatch) {
    return null;
  }

  const styleContent = styleMatch[1];
  const propertyMatch = styleContent.match(STYLE_PROPERTY_VALUE_REGEX);

  if (!propertyMatch) {
    return null;
  }

  return {
    propertyName: propertyMatch[1],
    propertyValue: propertyMatch[2],
  };
}

/**
 * Extracts ALL CSS properties from a tag's style attribute.
 * Handles multi-property styles like "display:inline-block;width:100%;vertical-align:top;text-align:center".
 * Returns an empty array if the tag has no style attribute.
 */
export function extractAllStyleProperties(
  openingTagText: string
): Array<{ propertyName: string; propertyValue: string }> {
  const styleMatch = openingTagText.match(STYLE_ATTRIBUTE_REGEX);

  if (!styleMatch) {
    return [];
  }

  const styleContent = styleMatch[1];
  const declarations = styleContent.split(';');
  const properties: Array<{ propertyName: string; propertyValue: string }> = [];

  for (let index = 0; index < declarations.length; index += 1) {
    const declaration = declarations[index].trim();

    if (!declaration) {
      continue;
    }

    const colonIndex = declaration.indexOf(':');

    if (colonIndex === -1) {
      continue;
    }

    const propertyName = declaration.slice(0, colonIndex).trim();
    const propertyValue = declaration.slice(colonIndex + 1).trim();

    if (propertyName && propertyValue) {
      properties.push({ propertyName, propertyValue });
    }
  }

  return properties;
}
