interface IconProps {
  className?: string;
}

export function CalloutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m3 11 19-9-9 19-2-8-8-2z"/>
    </svg>
  );
}
