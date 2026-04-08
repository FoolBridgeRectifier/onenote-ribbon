export const subscriptUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Subscript button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="subscript"]');
  results.push({ test: 'subscript-exists', pass: !!btn });

  if (editor) {
    // T2: With selection wraps in <sub>
    editor.setValue('H2O');
    editor.setSelection({ line: 0, ch: 1 }, { line: 0, ch: 2 });
    btn?.click();
    results.push({ test: 'subscript-wraps-selection', pass: editor.getValue() === 'H<sub>2</sub>O' });

    // T3: Toggle off — strips <sub> tags
    editor.setValue('H<sub>2</sub>O');
    editor.setCursor({ line: 0, ch: 7 });
    btn?.click();
    results.push({ test: 'subscript-strips-tags', pass: editor.getValue() === 'H2O' });

    editor.setValue('');
  }

  return results;
}`;
