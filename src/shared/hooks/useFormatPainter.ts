import { useState } from 'react';
import { Editor } from 'obsidian';
import {
  FormatPainterContextValue,
  FormatPainterFormat,
} from '../context/FormatPainterContext';
import { applyFormatPainter } from '../../tabs/home/clipboard/format-painter/helpers';

export function useFormatPainter(): FormatPainterContextValue {
  const [isActive, setIsActive] = useState(false);
  const [format, setFormat] = useState<FormatPainterFormat | null>(null);

  const apply = (editor: Editor, selection: string) => {
    if (!format) return;
    applyFormatPainter(editor, selection, format);
  };

  return {
    isActive,
    format,
    setIsActive,
    setFormat,
    apply,
  };
}
