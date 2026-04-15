interface IconProps {
  className?: string;
}

export function FootnoteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>
    </svg>
  );
}
