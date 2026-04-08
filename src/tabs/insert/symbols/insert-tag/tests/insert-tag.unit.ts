export const insertTagUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-tag"]');
  results.push({ test: 'insert-tag-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'tag-inserts-hash', pass: val === '#' });
    const cursor = editor.getCursor();
    results.push({ test: 'tag-cursor-after-hash', pass: cursor.ch === 1 });
    editor.setValue('');
  }

  return results;
}`;
