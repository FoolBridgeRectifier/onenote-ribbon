export const strikethroughUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Strikethrough button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="strikethrough"]');
  results.push({ test: 'strikethrough-exists', pass: !!btn });

  if (editor) {
    // T2: Toggle strikethrough on selection
    editor.setValue('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'strikethrough-wraps-selection', pass: editor.getValue() === '~~hello~~' });

    // T3: Toggle strikethrough off
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    btn?.click();
    results.push({ test: 'strikethrough-unwraps-selection', pass: editor.getValue() === 'hello' });

    // T4: No selection — inserts ~~~~ at cursor
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'strikethrough-inserts-pair', pass: editor.getValue() === '~~~~' });

    editor.setValue('');
  }

  return results;
}`;
