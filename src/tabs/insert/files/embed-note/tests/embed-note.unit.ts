export const embedNoteUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="embed-note"]');
  results.push({ test: 'embed-note-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'embed-note-inserts-embed', pass: val === '![[]]' });
    const cursor = editor.getCursor();
    results.push({ test: 'embed-note-cursor-inside', pass: cursor.ch === 3 });
    editor.setValue('');
  }

  return results;
}`;
