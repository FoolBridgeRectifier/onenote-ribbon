import { STYLE_ATTRIBUTE_REGEX, STYLE_PROPERTY_VALUE_REGEX } from './constants';
import type { StyleProperty } from './interfaces';

/**
 * Extracts the FIRST CSS property name/value from a span's opening tag.
 * Returns null if the tag has no style attribute or cannot be parsed.
 */
export function extractStylePropertyFromOpeningTag(
  openingTagText: string
): StyleProperty | null {
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
 * Extracts ALL CSS properties from a tag's style attribute. Handles multi-property
 * styles like "display:inline-block;width:100%;text-align:center".
 */
export function extractAllStyleProperties(openingTagText: string): StyleProperty[] {
  const styleMatch = openingTagText.match(STYLE_ATTRIBUTE_REGEX);

  if (!styleMatch) {
    return [];
  }

  const styleContent = styleMatch[1];
  const declarations = styleContent.split(';');
  const properties: StyleProperty[] = [];

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
