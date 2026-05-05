import { ESpanStyleTagType } from '../../../../interfaces';

/**
 * Span style tags ordered so more-specific style properties (multi-property
 * `text-align`) appear before single-property ones to avoid false matches.
 * Each `open` pattern captures the full style attribute value in group 1.
 */
export const SPAN_TAG_REGEX = [
  // Align — multi-property span; check for `text-align:` before single-prop spans.
  {
    type: ESpanStyleTagType.ALIGN,
    isHTML: true,
    cssProperty: 'text-align',
    open: /<\s*span\s+style\s*=\s*"([^"]*text-align\s*:[^"]*)"\s*>/g,
    close: /<\/\s*span\s*>/g,
  },
  {
    type: ESpanStyleTagType.COLOR,
    isHTML: true,
    cssProperty: 'color',
    // `(?<!-)color` prevents `background-color:` (and any `*-color:` variant) from matching —
    // the lookbehind ensures `color` is not immediately preceded by a hyphen.
    open: /<\s*span\s+style\s*=\s*"([^"]*(?<!-)color\s*:[^"]*)"\s*>/g,
    close: /<\/\s*span\s*>/g,
  },
  {
    type: ESpanStyleTagType.FONT_SIZE,
    isHTML: true,
    cssProperty: 'font-size',
    open: /<\s*span\s+style\s*=\s*"([^"]*font-size\s*:[^"]*)"\s*>/g,
    close: /<\/\s*span\s*>/g,
  },
  {
    type: ESpanStyleTagType.FONT_FAMILY,
    isHTML: true,
    cssProperty: 'font-family',
    open: /<\s*span\s+style\s*=\s*"([^"]*font-family\s*:[^"]*)"\s*>/g,
    close: /<\/\s*span\s*>/g,
  },
  {
    type: ESpanStyleTagType.HIGHLIGHT,
    isHTML: true,
    cssProperty: 'background',
    open: /<\s*span\s+style\s*=\s*"([^"]*background\s*:[^"]*)"\s*>/g,
    close: /<\/\s*span\s*>/g,
  },
];
