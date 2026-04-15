/** Custom tag persisted in localStorage. */
export interface CustomTag {
  /** Unique identifier (UUID-style string). */
  id: string;
  /** Display name shown in the dropdown and ribbon. */
  name: string;
  /** Hex color used for the checkbox indicator (e.g. "#4472C4"). */
  color: string;
  /** Obsidian callout type that this tag maps to (e.g. "note", "tip"). */
  calloutType: string;
}
