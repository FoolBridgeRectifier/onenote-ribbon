/** A user-created custom tag persisted to localStorage. */
export interface CustomTag {
  /** UUID-style string that uniquely identifies this tag. */
  id: string;
  /** The display name shown in the dropdown and ribbon. */
  name: string;
  /** Hex color string (e.g. "#4472C4") used for the checkbox indicator. */
  color: string;
  /** Obsidian callout type this tag maps to (e.g. "note", "tip"). */
  calloutType: string;
}

/** Props for the CustomizeTagsModal component. */
export interface CustomizeTagsModalProps {
  /** The current list of custom tags to display and manage. */
  customTags: CustomTag[];
  /** Called when the user makes changes that should update the persisted list. */
  onChange: (updatedTags: CustomTag[]) => void;
  /** Called when the user dismisses the modal. */
  onClose: () => void;
}
