/** Defines one bullet style preset: four symbols for nesting levels 1-4. */
export interface BulletPreset {
  /** Stable identifier used in stored settings. */
  id: string;
  /** Human-readable label shown in the library grid. */
  label: string;
  /**
   * Four Unicode symbols, one per nesting depth (L1→L4).
   * Use an empty array to represent "None" (remove overrides).
   */
  levels: [string, string, string, string] | [];
}

/**
 * Style type for a single depth level in a numbered list.
 * Maps to CSS list-style-type values.
 */
export type NumberStyleType =
  | 'decimal'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-roman'
  | 'upper-roman';

/**
 * Suffix type for numbered list markers.
 */
export type NumberSuffixType = 'period' | 'paren' | 'wrapped';

/**
 * Configuration for a single depth level in a number preset.
 */
export interface NumberLevelConfig {
  /** The counter style (decimal, alpha, roman). */
  style: NumberStyleType;
  /** The suffix format (period: "1.", paren: "1)", wrapped: "(1)"). */
  suffix: NumberSuffixType;
}

/** Defines one numbered list style preset with depth-aware formatting. */
export interface NumberPreset {
  /** Stable identifier used in stored settings. */
  id: string;
  /** Human-readable label shown in the library grid. */
  label: string;
  /**
   * Four level configurations, one per nesting depth (L1→L4).
   * Use an empty array to represent "None" (remove overrides).
   */
  levels: [NumberLevelConfig, NumberLevelConfig, NumberLevelConfig, NumberLevelConfig] | [];
}

/** Persisted plugin settings for list style preferences. */
export interface ListStyleSettings {
  bulletPresetId: string;
  numberPresetId: string;
}

/** Value exposed by the useListStyleInjection hook. */
export interface ListStyleContextValue {
  bulletPresetId: string;
  numberPresetId: string;
  setBulletPreset: (presetId: string) => void;
  setNumberPreset: (presetId: string) => void;
}
