export const insertHrUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-hr"]');
  results.push({ test: 'insert-hr-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'hr-inserts-rule', pass: val.includes('---') });
    editor.setValue('');
  }

  return results;
}`;
