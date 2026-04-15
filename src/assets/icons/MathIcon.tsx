interface IconProps {
  className?: string;
}

export function MathIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M18 7H6l6 5-6 5h12"/>
    </svg>
  );
}
