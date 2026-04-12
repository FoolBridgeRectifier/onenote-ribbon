interface IconProps {
  className?: string;
}

// Clipboard with code angle brackets — represents "Paste as code block"
export function PasteCodeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
      {/* < bracket */}
      <polyline
        points="9,12 7,14.5 9,17"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* > bracket */}
      <polyline
        points="15,12 17,14.5 15,17"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
