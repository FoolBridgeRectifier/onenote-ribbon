import './group-shell.css';

type GroupShellProps = {
  name: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;

export function GroupShell({
  name,
  className,
  children,
  ...restProps
}: GroupShellProps) {
  const combinedClassName = className
    ? `onr-group ${className}`
    : 'onr-group';

  return (
    <div className={combinedClassName} {...restProps}>
      {children}
      <div className="onr-group-name">{name}</div>
    </div>
  );
}
