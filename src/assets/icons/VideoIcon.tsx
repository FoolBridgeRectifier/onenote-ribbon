interface IconProps {
  className?: string;
}

export function VideoIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m22 8-6 4 6 4V8z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
    </svg>
  );
}
