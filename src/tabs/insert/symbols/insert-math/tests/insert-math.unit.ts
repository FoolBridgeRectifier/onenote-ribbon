export const insertMathUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-math"]');
  results.push({ test: 'insert-math-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'math-has-delimiters', pass: (val.match(/\\$\\$/g) || []).length >= 2 });
    const cursor = editor.getCursor();
    results.push({ test: 'math-cursor-inside', pass: cursor.line === 1 && cursor.ch === 0 });
    editor.setValue('');
  }

  return results;
}`;
