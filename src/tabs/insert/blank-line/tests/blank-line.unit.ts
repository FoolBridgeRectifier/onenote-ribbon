export const blankLineUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="blank-line"]');
  results.push({ test: 'blank-line-exists', pass: !!btn });

  if (editor) {
    editor.setValue('Line one');
    editor.setCursor({ line: 0, ch: 8 });
    btn?.click();
    results.push({ test: 'blank-line-inserts-newline', pass: editor.getValue() === 'Line one\\n' });
    editor.setValue('');
  }

  return results;
}`;
