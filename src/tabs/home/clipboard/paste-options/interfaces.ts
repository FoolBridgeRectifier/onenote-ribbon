/** A single paste option shown in the paste options dropdown. */
export interface PasteOption {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

/** Props for the PasteOptionsDropdown component. */
export interface PasteOptionsDropdownProps {
  anchor: HTMLElement | null;
  options: PasteOption[];
  onClose: () => void;
}
