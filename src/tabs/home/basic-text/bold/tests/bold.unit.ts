export const boldUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Bold button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="bold"]');
  results.push({ test: 'bold-exists', pass: !!btn });

  if (editor) {
    // T2: Toggle bold on selection
    editor.setValue('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'bold-wraps-selection', pass: editor.getValue() === '**hello**' });

    // T3: Toggle bold off
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    btn?.click();
    results.push({ test: 'bold-unwraps-selection', pass: editor.getValue() === 'hello' });

    // T4: No selection — inserts ** ** at cursor
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bold-inserts-pair', pass: editor.getValue() === '****' });

    editor.setValue('');
  }

  return results;
}`;
