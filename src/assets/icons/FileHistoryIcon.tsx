interface IconProps {
  className?: string;
}

export function FileHistoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 13a4 4 0 0 0 4 4"/><circle cx="3" cy="13" r="1"/><path d="M6 14v-2.5"/>
    </svg>
  );
}
