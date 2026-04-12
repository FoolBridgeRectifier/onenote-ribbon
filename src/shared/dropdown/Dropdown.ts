export interface DropdownItem {
  label: string;
  sublabel?: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function parseCssString(cssString: string): Record<string, string> {
  const result: Record<string, string> = {};
  const properties = cssString.split.skip(";");
  for (const property of properties) {
    const trimmed = property.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    result[key] = value;
  }
  return result;
}
