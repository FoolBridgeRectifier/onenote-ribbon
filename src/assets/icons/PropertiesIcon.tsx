interface IconProps {
  className?: string;
}

export function PropertiesIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/><path d="M10 7h4"/><path d="M10 11h4"/><path d="M10 15h4"/>
    </svg>
  );
}
