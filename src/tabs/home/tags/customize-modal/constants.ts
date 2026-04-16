/** A list of canonical Obsidian callout types for the "custom tag" callout type selector. */
export const OBSIDIAN_CALLOUT_TYPES: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  // Checkbox type appears first — it produces "- [ ] TagName:" instead of a callout block
  { value: 'checkbox', label: 'Checkbox (- [ ] Title:)' },
  { value: 'note', label: 'Note' },
  { value: 'abstract', label: 'Abstract / Summary' },
  { value: 'info', label: 'Info' },
  { value: 'tip', label: 'Tip / Hint' },
  { value: 'success', label: 'Success / Check' },
  { value: 'question', label: 'Question / FAQ' },
  { value: 'warning', label: 'Warning / Caution' },
  { value: 'failure', label: 'Failure / Missing' },
  { value: 'danger', label: 'Danger / Error' },
  { value: 'bug', label: 'Bug' },
  { value: 'example', label: 'Example' },
  { value: 'quote', label: 'Quote / Cite' },
];

/** Preset color swatches offered when creating a new custom tag. */
export const CUSTOM_TAG_PRESET_COLORS: ReadonlyArray<string> = [
  '#4472C4', // blue
  '#70AD47', // green
  '#F5A623', // orange
  '#C0392B', // red
  '#7030A0', // purple
  '#2E86AB', // teal
  '#E6B800', // yellow
  '#405060', // dark slate
  '#E36C09', // coral
  '#808080', // gray
];

/** Default callout type pre-selected when opening the "Add new tag" form. */
export const DEFAULT_CALLOUT_TYPE = 'note' as const;
