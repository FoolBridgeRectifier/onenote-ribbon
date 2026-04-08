export const insertCodeBlockUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-code-block"]');
  results.push({ test: 'code-block-btn-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'code-block-has-fences', pass: (val.match(/\`\`\`/g) || []).length >= 2 });

    // Cursor positioned inside the block (line 1)
    const cursor = editor.getCursor();
    results.push({ test: 'code-block-cursor-inside', pass: cursor.line === 1 && cursor.ch === 0 });

    editor.setValue('');
  }

  return results;
}`;
