import { useState } from "react";

export interface FormatPainterFormat {
  headPrefix: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export function useFormatPainter() {
  const [active, setActive] = useState(false);
  const [format, setFormat] = useState<FormatPainterFormat | null>(null);

  const capture = (newFormat: FormatPainterFormat) => {
    setFormat(newFormat);
    setActive(true);
  };

  const clear = () => {
    setFormat(null);
    setActive(false);
  };

  return { active, format, capture, clear };
}
