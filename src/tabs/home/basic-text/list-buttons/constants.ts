import type { BulletPreset, NumberPreset } from './interfaces';

/** CSS selector targeting reading-view list items at a given nesting depth. */
export const READING_VIEW_SCOPES = [
  '.markdown-preview-view',
  '.markdown-rendered',
] as const;

/** ID used when no override is active for bullet style. */
export const BULLET_PRESET_NONE_ID = 'none';

/** ID used when no override is active for number style. */
export const NUMBER_PRESET_NONE_ID = 'none';

/** Number of nesting depths each bullet preset must define (L1 → L4). */
export const REQUIRED_BULLET_DEPTH_COUNT = 4;

/** Default settings applied on first load (no overrides). */
export const DEFAULT_LIST_STYLE_SETTINGS = {
  bulletPresetId: BULLET_PRESET_NONE_ID,
  numberPresetId: NUMBER_PRESET_NONE_ID,
} as const;

/**
 * All bullet presets, ordered as they appear in the library grid (None first).
 * Each preset defines Unicode symbols for 4 nesting levels (L1 → L4).
 */
export const BULLET_PRESETS: BulletPreset[] = [
  { id: 'none',      label: 'None',      levels: [] },
  { id: 'classic',   label: 'Classic',   levels: ['●', '○', '■', '□'] },
  { id: 'diamond',   label: 'Diamond',   levels: ['◆', '◇', '●', '○'] },
  { id: 'arrow',     label: 'Arrow',     levels: ['→', '▸', '–', '·'] },
  { id: 'star',      label: 'Star',      levels: ['✦', '◇', '◆', '○'] },
  { id: 'square',    label: 'Square',    levels: ['■', '□', '●', '○'] },
  { id: 'dash',      label: 'Dash',      levels: ['—', '–', '·', '·'] },
  { id: 'checkmark', label: 'Check',     levels: ['✓', '●', '○', '■'] },
];

/**
 * All number presets, ordered as they appear in the library grid (None first).
 * For period-suffix styles we use `cssListStyleType` to let the browser handle
 * counter generation. For paren/wrapped variants we supply inline `markerContent`.
 */
export const NUMBER_PRESETS: NumberPreset[] = [
  // Row 1: None + period-suffix styles
  { id: 'none',                 label: 'None',           markerContent: '' },
  { id: 'decimal-period',       label: '1. 2. 3.',       markerContent: '', cssListStyleType: 'decimal' },
  { id: 'lower-alpha-period',   label: 'a. b. c.',       markerContent: '', cssListStyleType: 'lower-alpha' },
  { id: 'upper-alpha-period',   label: 'A. B. C.',       markerContent: '', cssListStyleType: 'upper-alpha' },

  // Row 2: roman period + paren variants
  { id: 'lower-roman-period',   label: 'i. ii. iii.',    markerContent: '', cssListStyleType: 'lower-roman' },
  { id: 'upper-roman-period',   label: 'I. II. III.',    markerContent: '', cssListStyleType: 'upper-roman' },
  { id: 'decimal-paren',        label: '1) 2) 3)',        markerContent: 'counter(list-item, decimal) ")  "' },
  { id: 'lower-alpha-paren',    label: 'a) b) c)',        markerContent: 'counter(list-item, lower-alpha) ")  "' },

  // Row 3
  { id: 'upper-alpha-paren',    label: 'A) B) C)',        markerContent: 'counter(list-item, upper-alpha) ")  "' },
  { id: 'lower-roman-paren',    label: 'i) ii) iii)',     markerContent: 'counter(list-item, lower-roman) ")  "' },
  { id: 'upper-roman-paren',    label: 'I) II) III)',     markerContent: 'counter(list-item, upper-roman) ")  "' },
  { id: 'decimal-wrapped',      label: '(1) (2) (3)',     markerContent: '"(" counter(list-item, decimal) ")  "' },

  // Row 4
  { id: 'lower-alpha-wrapped',  label: '(a) (b) (c)',    markerContent: '"(" counter(list-item, lower-alpha) ")  "' },
  { id: 'upper-alpha-wrapped',  label: '(A) (B) (C)',    markerContent: '"(" counter(list-item, upper-alpha) ")  "' },
  { id: 'lower-roman-wrapped',  label: '(i) (ii) (iii)', markerContent: '"(" counter(list-item, lower-roman) ")  "' },
  { id: 'upper-roman-wrapped',  label: '(I) (II) (III)', markerContent: '"(" counter(list-item, upper-roman) ")  "' },
];

/** `data-cmd` values used on the split-button sub-regions for test targeting. */
export const LIST_BTN_CMD_BULLET_TOGGLE  = 'bullet-list-toggle';
export const LIST_BTN_CMD_BULLET_CARET   = 'bullet-list-caret';
export const LIST_BTN_CMD_NUMBER_TOGGLE  = 'number-list-toggle';
export const LIST_BTN_CMD_NUMBER_CARET   = 'number-list-caret';
export const LIST_BTN_CMD_OUTDENT        = 'outdent';
export const LIST_BTN_CMD_INDENT         = 'indent';

/** DOM id for the injected list-style `<style>` element. */
export const LIST_STYLE_ELEMENT_ID = 'onr-list-style';
