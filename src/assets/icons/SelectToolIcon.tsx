interface IconProps {
  className?: string;
}

export function SelectToolIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/>
    </svg>
  );
}
