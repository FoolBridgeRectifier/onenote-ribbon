interface IconProps {
  className?: string;
}

export function IndentIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <polyline points="17 8 21 12 17 16" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="13" y2="6" />
      <line x1="3" y1="18" x2="13" y2="18" />
    </svg>
  );
}
