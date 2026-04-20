/** Props for the RibbonButton component. */
export type RibbonButtonProps = {
  size?: 'large' | 'small';
  icon?: React.ReactNode;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;
