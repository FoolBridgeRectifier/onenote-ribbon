export const insertDateUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-date"]');
  results.push({ test: 'insert-date-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'date-format-yyyy-mm-dd', pass: /\\d{4}-\\d{2}-\\d{2}/.test(val) });
    editor.setValue('');
  }

  return results;
}`;
