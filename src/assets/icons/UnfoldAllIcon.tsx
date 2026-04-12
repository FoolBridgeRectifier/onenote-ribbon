interface IconProps {
  className?: string;
}

export function UnfoldAllIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <polyline points="21 8 18 8 18 3" />
      <polyline points="21 16 18 16 18 21" />
      <line x1="3" y1="8" x2="18" y2="8" />
      <line x1="3" y1="16" x2="18" y2="16" />
    </svg>
  );
}
