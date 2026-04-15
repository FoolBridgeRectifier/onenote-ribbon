interface IconProps {
  className?: string;
}

export function RecentFilesIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
