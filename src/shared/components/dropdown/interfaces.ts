import type { HTMLAttributes, ReactNode } from 'react';

/** A single item in a Dropdown list. */
export interface DropdownItem {
  label: string;
  sublabel?: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

/** Props for the Dropdown component. */
export type DropdownProps = {
  anchor: HTMLElement | null;
  items?: DropdownItem[];
  onClose: () => void;
  children?: ReactNode;
  offsetY?: number;
  offsetX?: number;
  constrainLeftToViewport?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'style'>;
