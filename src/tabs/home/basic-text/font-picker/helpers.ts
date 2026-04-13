import { Editor } from 'obsidian';

// Wraps the current selection in a span with the given font-family inline style.
export function applyFontFamily(editor: Editor, fontFamily: string): void {
  const selection = editor.getSelection();
  if (!selection) return;

  editor.replaceSelection(
    `<span style="font-family: '${fontFamily}'">${selection}</span>`,
  );
}

// Wraps the current selection in a span with the given font-size in points (pt).
// SIZES in FontPicker are OneNote point values, not pixels.
export function applyFontSize(editor: Editor, sizeInPt: number): void {
  const selection = editor.getSelection();
  if (!selection) return;

  editor.replaceSelection(
    `<span style="font-size: ${sizeInPt}pt">${selection}</span>`,
  );
}
