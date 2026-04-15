interface IconProps {
  className?: string;
}

export function FileRecoveryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>
    </svg>
  );
}
