export interface DropdownItem {
  label: string;
  sublabel?: string;
  onClick: () => void;
  icon?: React.ReactNode;
}
