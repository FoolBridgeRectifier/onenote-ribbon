import type { ReactNode } from 'react';

/**
 * Describes how a tag transforms the current line in the editor.
 * Each variant maps to a distinct formatting strategy.
 */
export type TagAction =
  | { type: 'command'; commandId: string }
  | { type: 'callout'; calloutType: string }
  | { type: 'task'; taskPrefix: string }
  | { type: 'highlight' };

/** A single selectable tag entry shown in the dropdown. */
export interface TagDefinition {
  label: string;
  /** Hex color rendered as the right-side swatch box. */
  swatchColor: string;
  /** Small 13×13 icon rendered on the left of each row. */
  icon: ReactNode;
  action: TagAction;
  /** When true, the item is shown but not clickable (e.g. "Remove Tag"). */
  isDisabled?: boolean;
}

/** A horizontal divider line between tag groups. */
export interface TagSeparatorEntry {
  isSeparator: true;
}

export type TagOrSeparator = TagDefinition | TagSeparatorEntry;

/** Type guard to distinguish a separator from a tag entry. */
export function isTagSeparator(item: TagOrSeparator): item is TagSeparatorEntry {
  return (item as TagSeparatorEntry).isSeparator === true;
}
