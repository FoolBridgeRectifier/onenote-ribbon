interface IconProps {
  className?: string;
}

export function SplitHorizontalIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  );
}
