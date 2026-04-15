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
  /** Hex color used for a custom tag's icon indicator. */
  swatchColor: string;
  /** Small 13×13 icon rendered on the left of each row. */
  icon: ReactNode;
  action: TagAction;
  /**
   * Key used to detect if this tag is active at the cursor.
   * Matches a callout type (e.g. "important") or a special key
   * ("__task__" or "__highlight__").
   */
  calloutKey?: string;
  /** When true, clicking opens the Customize Tags modal instead of applying a tag. */
  isCustomizeTags?: boolean;
  /** When true, clicking removes the active callout from the current line. */
  isRemoveTag?: boolean;
  /** When true, the item is shown but not clickable (e.g. "Remove Tag" with no active tag). */
  isDisabled?: boolean;
}

/** A horizontal divider line between tag groups. */
export interface TagSeparatorEntry {
  isSeparator: true;
}

export type TagOrSeparator = TagDefinition | TagSeparatorEntry;

/** Type guard to distinguish a separator from a tag entry. */
export function isTagSeparator(
  item: TagOrSeparator,
): item is TagSeparatorEntry {
  return (item as TagSeparatorEntry).isSeparator === true;
}
