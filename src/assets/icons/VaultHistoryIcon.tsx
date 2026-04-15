interface IconProps {
  className?: string;
}

export function VaultHistoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/>
    </svg>
  );
}
