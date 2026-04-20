/** Props for the GroupShell container component. */
export type GroupShellProps = {
  name: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;
