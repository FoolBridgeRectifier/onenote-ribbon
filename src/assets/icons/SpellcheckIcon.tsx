interface IconProps {
  className?: string;
}

export function SpellcheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m6 16 6-12 6 12"/><path d="M8 12h8"/><path d="m16 20 2 2 4-4"/>
    </svg>
  );
}
