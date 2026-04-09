export interface DropdownItem {
  label: string;
  sublabel?: string;
  style?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface DropdownOpts {
  bg?: string;
  hoverBg?: string;
  color?: string;
}
