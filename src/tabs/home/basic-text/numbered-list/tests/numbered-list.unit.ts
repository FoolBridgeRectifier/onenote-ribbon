export const numberedListUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Numbered list button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="numbered-list"]');
  results.push({ test: 'numbered-list-exists', pass: !!btn });

  if (editor) {
    // T2: Adds numbered prefix
    editor.setValue('hello');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'numbered-list-adds-prefix', pass: editor.getValue() === '1. hello' });

    // T3: Removes numbered prefix
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'numbered-list-removes-prefix', pass: editor.getValue() === 'hello' });

    editor.setValue('');
  }

  return results;
}`;
