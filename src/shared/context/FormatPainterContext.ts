import { createContext, useContext } from 'react';
import { Editor } from 'obsidian';

export interface FormatPainterFormat {
  prefix: string;
  suffix: string;
}

export interface FormatPainterContextValue {
  isActive: boolean;
  format: FormatPainterFormat | null;
  setIsActive: (active: boolean) => void;
  setFormat: (format: FormatPainterFormat | null) => void;
  apply: (editor: Editor, selection: string) => void;
}

export const FormatPainterContext = createContext<FormatPainterContextValue>(null!);

export const useFormatPainterContext = () => useContext(FormatPainterContext);
