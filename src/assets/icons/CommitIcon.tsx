interface IconProps {
  className?: string;
}

export function CommitIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/>
    </svg>
  );
}
