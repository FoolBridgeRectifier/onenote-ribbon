import { Editor } from "obsidian";

// Wraps the current selection in a span with the given font-family inline style.
export function applyFontFamily(editor: Editor, fontFamily: string): void {
  const selection = editor.getSelection();
  if (!selection) return;

  editor.replaceSelection(
    `<span style="font-family: '${fontFamily}'">${selection}</span>`,
  );
}
