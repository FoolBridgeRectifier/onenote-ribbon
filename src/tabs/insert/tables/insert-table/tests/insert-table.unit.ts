export const insertTableUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-table"]');
  results.push({ test: 'insert-table-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'table-has-header-row', pass: val.includes('| col | col | col |') });
    results.push({ test: 'table-has-separator', pass: val.includes('|---|---|---|') });
    results.push({ test: 'table-has-data-row', pass: val.includes('| | | |') });
    editor.setValue('');
  }

  return results;
}`;
