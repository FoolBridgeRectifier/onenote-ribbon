interface IconProps {
  className?: string;
}

export function NewWindowIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>
    </svg>
  );
}
