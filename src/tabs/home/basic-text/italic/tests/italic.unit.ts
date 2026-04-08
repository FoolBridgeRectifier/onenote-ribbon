export const italicUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Italic button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="italic"]');
  results.push({ test: 'italic-exists', pass: !!btn });

  if (editor) {
    // T2: Toggle italic on selection
    editor.setValue('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'italic-wraps-selection', pass: editor.getValue() === '*hello*' });

    // T3: Toggle italic off
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 7 });
    btn?.click();
    results.push({ test: 'italic-unwraps-selection', pass: editor.getValue() === 'hello' });

    // T4: No selection — inserts * * at cursor
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'italic-inserts-pair', pass: editor.getValue() === '**' });

    editor.setValue('');
  }

  return results;
}`;
