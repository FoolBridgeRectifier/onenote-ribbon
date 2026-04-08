export const bulletListUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Bullet list button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="bullet-list"]');
  results.push({ test: 'bullet-list-exists', pass: !!btn });

  if (editor) {
    // T2: Adds bullet prefix
    editor.setValue('hello');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bullet-list-adds-prefix', pass: editor.getValue() === '- hello' });

    // T3: Removes bullet prefix
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bullet-list-removes-prefix', pass: editor.getValue() === 'hello' });

    editor.setValue('');
  }

  return results;
}`;
