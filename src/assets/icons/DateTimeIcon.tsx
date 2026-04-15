interface IconProps {
  className?: string;
}

export function DateTimeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><circle cx="16" cy="16" r="4"/><line x1="16" x2="16" y1="14" y2="16"/><line x1="16" x2="17" y1="16" y2="16"/>
    </svg>
  );
}
