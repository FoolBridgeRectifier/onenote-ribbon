interface IconProps {
  className?: string;
}

export function ImportantTagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#F5A623" />
      <polygon
        points="8,3 9.5,6.5 13,7 10.5,9.5 11,13 8,11.5 5,13 5.5,9.5 3,7 6.5,6.5"
        fill="white"
      />
    </svg>
  );
}
