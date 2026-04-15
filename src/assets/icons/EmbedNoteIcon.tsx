interface IconProps {
  className?: string;
}

export function EmbedNoteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="16"/><polyline points="10 14 12 16 14 14"/>
    </svg>
  );
}
