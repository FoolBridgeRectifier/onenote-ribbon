export function toggleInline(editor: any, open: string, close?: string): void {
  const cl = close ?? open;
  const sel = editor.getSelection();
  if (sel) {
    // Unwrap only when the selection is *exactly* wrapped with open/cl.
    // For symmetric markers (open === cl, e.g. "*" or "**") also ensure the
    // character immediately inside the markers is not another instance of the
    // same marker character — this prevents treating "**text**" as italic text.
    const isWrapped =
      sel.startsWith(open) &&
      sel.endsWith(cl) &&
      sel.length > open.length + cl.length &&
      (open === cl
        ? sel[open.length] !== open[open.length - 1] &&
          sel[sel.length - cl.length - 1] !== cl[0]
        : true);
    if (isWrapped) {
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
