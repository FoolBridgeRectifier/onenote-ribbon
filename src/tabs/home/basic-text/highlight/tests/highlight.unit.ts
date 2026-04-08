export const highlightUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Highlight button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="highlight"]');
  results.push({ test: 'highlight-exists', pass: !!btn });

  // T2: Highlight swatch present
  results.push({ test: 'highlight-swatch-present', pass: !!document.getElementById('onr-highlight-swatch') });

  if (editor) {
    // T3: Toggle highlight on selection
    editor.setValue('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'highlight-wraps-selection', pass: editor.getValue() === '==hello==' });

    // T4: Toggle highlight off
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    btn?.click();
    results.push({ test: 'highlight-unwraps-selection', pass: editor.getValue() === 'hello' });

    editor.setValue('');
  }

  return results;
}`;
