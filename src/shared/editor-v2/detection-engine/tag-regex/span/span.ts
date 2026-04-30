import { ESpanStyleTagType } from '../../../interfaces';

/**
 * Span style tags ordered so more-specific style properties (multi-property
 * `text-align`) appear before single-property ones to avoid false matches.
 * Each `open` pattern captures the full style attribute value in group 1.
 */
export const SPAN_TAG_REGEX = [
  // Align — multi-property span; check for `text-align:` before single-prop spans.
  {
    type: ESpanStyleTagType.ALIGN,
    cssProperty: 'text-align',
    open: /<\s*span\s+style\s*=\s*"([^"]*text-align\s*:[^"]*)"\s*>/,
    close: /<\/\s*span\s*>/,
  },
  {
    type: ESpanStyleTagType.COLOR,
    cssProperty: 'color',
    open: /<\s*span\s+style\s*=\s*"([^"]*color\s*:[^"]*)"\s*>/,
    close: /<\/\s*span\s*>/,
  },
  {
    type: ESpanStyleTagType.FONT_SIZE,
    cssProperty: 'font-size',
    open: /<\s*span\s+style\s*=\s*"([^"]*font-size\s*:[^"]*)"\s*>/,
    close: /<\/\s*span\s*>/,
  },
  {
    type: ESpanStyleTagType.FONT_FAMILY,
    cssProperty: 'font-family',
    open: /<\s*span\s+style\s*=\s*"([^"]*font-family\s*:[^"]*)"\s*>/,
    close: /<\/\s*span\s*>/,
  },
  {
    type: ESpanStyleTagType.HIGHLIGHT,
    cssProperty: 'background',
    open: /<\s*span\s+style\s*=\s*"([^"]*background\s*:[^"]*)"\s*>/,
    close: /<\/\s*span\s*>/,
  },
];
