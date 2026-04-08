export function toggleInline(editor: any, open: string, close?: string): void {
  const cl = close ?? open;
  const sel = editor.getSelection();
  if (sel) {
    if (sel.startsWith(open) && sel.endsWith(cl)) {
      editor.replaceSelection(sel.slice(open.length, sel.length - cl.length));
    } else {
      editor.replaceSelection(`${open}${sel}${cl}`);
    }
  } else {
    const cursor = editor.getCursor();
    editor.replaceRange(`${open}${cl}`, cursor);
    editor.setCursor({ line: cursor.line, ch: cursor.ch + open.length });
  }
}
