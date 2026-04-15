interface IconProps {
  className?: string;
}

export function SplitVerticalIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2"/><line x1="12" y1="2" x2="12" y2="22"/>
    </svg>
  );
}
