import { CSS_PROPERTY_TO_TAG_TYPE } from '../constants';

/**
 * Inspects a span's `style="..."` attribute string and returns the TagType
 * that the span represents. Handles compound styles (the `align` form uses
 * `display:inline-block;...;text-align:center`).
 *
 * Returns null when the style does not match any recognised tag form.
 */
export function parseSpanStyleAttribute(styleAttribute: string): string | null {
  const normalised = styleAttribute.toLowerCase();

  // Align span has the multi-property signature; check before single-property mapping.
  if (normalised.includes('text-align:')) return 'align';

  // Find the first matching CSS property; spans only carry one styling intent each.
  for (const property of Object.keys(CSS_PROPERTY_TO_TAG_TYPE)) {
    const propertyPrefix = property + ':';
    if (normalised.includes(propertyPrefix)) return CSS_PROPERTY_TO_TAG_TYPE[property];
  }

  return null;
}
