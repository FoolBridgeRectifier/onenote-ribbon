export const insertTimeUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-time"]');
  results.push({ test: 'insert-time-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'time-format-hh-mm', pass: /\\d{2}:\\d{2}/.test(val) });
    editor.setValue('');
  }

  return results;
}`;
