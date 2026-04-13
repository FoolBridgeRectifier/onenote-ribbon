import { Editor } from 'obsidian';
import { FormatPainterFormat } from '../../../../shared/context/FormatPainterContext';

export function applyFormatPainter(
  editor: Editor,
  selection: string,
  format: FormatPainterFormat,
): void {
  if (!selection) return;

  const { prefix, suffix } = format;

  editor.replaceSelection(`${prefix}${selection}${suffix}`);
}
