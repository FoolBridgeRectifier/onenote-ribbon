import { Editor } from 'obsidian';

import { FormatPainterFormat } from '../../../../shared/hooks/useFormatPainter';

export function applyFormatPainter(editor: Editor, selection: string, format: FormatPainterFormat): void {
  let result = selection;
  if (format.isUnderline) result = `<u>${result}</u>`;
  if (format.isItalic)    result = `*${result}*`;
  if (format.isBold)      result = `**${result}**`;
  editor.replaceSelection(result);
  if (format.headPrefix) {
    const cursor = editor.getCursor();
    const line   = editor.getLine(cursor.line);
    if (!line.startsWith(format.headPrefix)) {
      editor.setLine(cursor.line, format.headPrefix + line.replace(/^#{1,6}\s+/, ''));
    }
  }
}
