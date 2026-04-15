interface IconProps {
  className?: string;
}

export function TableIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
    </svg>
  );
}
