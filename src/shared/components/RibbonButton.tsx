import React from "react";

interface Props {
  label?: string;
  icon?: React.ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "data-cmd"?: string;
  onMouseDown?: (event: React.MouseEvent) => void;
  onClick: (event: React.MouseEvent) => void;
}

export function RibbonButton({
  label,
  icon,
  title,
  active,
  disabled,
  className = "onr-btn-sm",
  style,
  onMouseDown,
  onClick,
  ...rest
}: Props) {
  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onMouseDown?.(event);
  };

  return (
    <div
      className={`${className}${active ? " onr-active" : ""}${disabled ? " onr-disabled" : ""}`}
      title={title}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      {...(rest["data-cmd"] ? { "data-cmd": rest["data-cmd"] } : {})}
    >
      {icon}
      {label && <span className="onr-btn-label-sm">{label}</span>}
    </div>
  );
}
