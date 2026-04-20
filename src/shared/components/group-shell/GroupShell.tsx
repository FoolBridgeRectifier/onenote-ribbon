import './group-shell.css';
import type { GroupShellProps } from './interfaces';

export function GroupShell({ name, className, children, ...restProps }: GroupShellProps) {
  const combinedClassName = className ? `onr-group ${className}` : 'onr-group';

  return (
    <div className={combinedClassName} {...restProps}>
      {children}
      <div className="onr-group-name">{name}</div>
    </div>
  );
}
