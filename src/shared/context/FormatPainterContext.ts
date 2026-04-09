import { createContext, useContext } from 'react';

import { FormatPainterFormat } from '../hooks/useFormatPainter';

export interface FormatPainterContextValue {
  active: boolean;
  format: FormatPainterFormat | null;
  capture: (format: FormatPainterFormat) => void;
  clear: () => void;
}

export const FormatPainterContext = createContext<FormatPainterContextValue>(null!);
export const useFormatPainterContext = () => useContext(FormatPainterContext);
