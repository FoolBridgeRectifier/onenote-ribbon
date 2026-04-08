export const insertWikilinkUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-wikilink"]');
  results.push({ test: 'insert-wikilink-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'wikilink-inserts-brackets', pass: val === '[[]]' });
    const cursor = editor.getCursor();
    results.push({ test: 'wikilink-cursor-inside', pass: cursor.ch === 2 });
    editor.setValue('');
  }

  return results;
}`;
