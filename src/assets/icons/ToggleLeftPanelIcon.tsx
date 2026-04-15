interface IconProps {
  className?: string;
}

export function ToggleLeftPanelIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/>
    </svg>
  );
}
