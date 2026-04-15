import { forwardRef } from 'react';
import './ribbon-button.css';

type RibbonButtonProps = {
  size?: 'large' | 'small';
  icon?: React.ReactNode;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;

export const RibbonButton = forwardRef<HTMLDivElement, RibbonButtonProps>(
  function RibbonButton(
    { size = 'small', icon, label, active, disabled, className, children, ...restProps },
    ref,
  ) {
    const baseClass = size === 'large' ? 'onr-btn' : 'onr-btn-sm';
    const activeClass = active ? ' onr-active' : '';
    // onr-disabled applies pointer-events:none + opacity, suppressing all interactions.
    const disabledClass = disabled ? ' onr-disabled' : '';
    const extraClass = className ? ` ${className}` : '';
    const combinedClassName = baseClass + activeClass + disabledClass + extraClass;

    const labelClass = size === 'large' ? 'onr-btn-label' : 'onr-btn-label-sm';

    // Prevent editor blur when clicking ribbon buttons.
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        aria-disabled={disabled || undefined}
        onMouseDown={handleMouseDown}
        {...restProps}
      >
        {children ?? (
          <>
            {icon}
            {label && <span className={labelClass}>{label}</span>}
          </>
        )}
      </div>
    );
  },
);