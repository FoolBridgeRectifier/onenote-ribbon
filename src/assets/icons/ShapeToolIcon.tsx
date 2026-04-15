interface IconProps {
  className?: string;
}

export function ShapeToolIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="2" y="7" width="10" height="10" rx="1"/><circle cx="17" cy="12" r="5"/>
    </svg>
  );
}
