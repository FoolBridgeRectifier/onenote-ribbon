interface IconProps {
  className?: string;
}

export function NavBackIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}
