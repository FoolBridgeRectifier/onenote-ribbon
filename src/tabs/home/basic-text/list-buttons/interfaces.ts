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

/** Defines one numbered list style preset. */
export interface NumberPreset {
  /** Stable identifier used in stored settings. */
  id: string;
  /** Human-readable label shown in the library grid. */
  label: string;
  /**
   * CSS `content` expression for the `::marker` pseudo-element.
   * Set to empty string to represent "None" (remove overrides).
   * Examples:
   *   'counter(list-item, decimal) ".  "'
   *   '"(" counter(list-item, lower-alpha) ")  "'
   */
  markerContent: string;
  /**
   * Optional CSS `list-style-type` property value.
   * When provided, this is used INSTEAD of a custom `markerContent`.
   * Prefer this for the simple period-suffix presets — it honours
   * Obsidian's own counter-reset handling correctly.
   */
  cssListStyleType?: string;
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
