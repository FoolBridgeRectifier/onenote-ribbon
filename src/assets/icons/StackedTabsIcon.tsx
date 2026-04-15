interface IconProps {
  className?: string;
}

export function StackedTabsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/>
    </svg>
  );
}
