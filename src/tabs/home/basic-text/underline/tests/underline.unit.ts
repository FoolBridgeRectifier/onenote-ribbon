export const underlineUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Underline button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="underline"]');
  results.push({ test: 'underline-exists', pass: !!btn });

  if (editor) {
    // T2: Toggle underline on selection
    editor.setValue('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'underline-wraps-selection', pass: editor.getValue() === '<u>hello</u>' });

    // T3: Toggle underline off
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 12 });
    btn?.click();
    results.push({ test: 'underline-unwraps-selection', pass: editor.getValue() === 'hello' });

    // T4: No selection — inserts <u></u> at cursor
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'underline-inserts-pair', pass: editor.getValue() === '<u></u>' });

    editor.setValue('');
  }

  return results;
}`;
