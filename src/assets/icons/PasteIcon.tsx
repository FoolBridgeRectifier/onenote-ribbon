interface IconProps {
  className?: string;
}

export function PasteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
      <polyline points="9 14 12 17 15 14" />
      <line x1="12" y1="10" x2="12" y2="17" />
    </svg>
  );
}
