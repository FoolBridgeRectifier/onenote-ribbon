export const insertTableEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Insert table mid-line — table inserted after cursor
    editor.setValue('Some text');
    editor.setCursor({ line: 0, ch: 4 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-table"]')?.click();
    results.push({ test: 'table-mid-line', pass: editor.getValue().includes('Some') && editor.getValue().includes('| col |') });

    // Edge 2: Empty file — table inserted
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-table"]')?.click();
    results.push({ test: 'table-empty-file', pass: editor.getValue().includes('col') });

    editor.setValue('');
  }

  return results;
}`;
