interface Props {
  label?: string;
  icon?: React.ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-cmd'?: string;
  onClick: (e: React.MouseEvent) => void;
}

export function RibbonButton({
  label,
  icon,
  title,
  active,
  disabled,
  className = 'onr-btn-sm',
  style,
  'data-cmd': dataCmd,
  onClick,
}: Props) {
  return (
    <div
      className={`${className}${active ? ' onr-active' : ''}${disabled ? ' onr-disabled' : ''}`}
      title={title}
      style={style}
      data-cmd={dataCmd}
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={onClick}
    >
      {icon}
      {label && <span className="onr-btn-label-sm">{label}</span>}
    </div>
  );
}
