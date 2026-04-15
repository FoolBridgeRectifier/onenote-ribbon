interface IconProps {
  className?: string;
}

export function AddCardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect width="18" height="12" x="3" y="6" rx="2"/><path d="M3 10h18M7 15h.01M11 15h2"/>
    </svg>
  );
}
