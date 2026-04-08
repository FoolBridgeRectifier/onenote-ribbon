export const superscriptUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Superscript button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="superscript"]');
  results.push({ test: 'superscript-exists', pass: !!btn });

  if (editor) {
    // T2: With selection wraps in <sup>
    editor.setValue('x2');
    editor.setSelection({ line: 0, ch: 1 }, { line: 0, ch: 2 });
    btn?.click();
    results.push({ test: 'superscript-wraps-selection', pass: editor.getValue() === 'x<sup>2</sup>' });

    // T3: Toggle off — strips <sup> tags
    editor.setValue('x<sup>2</sup>');
    editor.setCursor({ line: 0, ch: 7 });
    btn?.click();
    results.push({ test: 'superscript-strips-tags', pass: editor.getValue() === 'x2' });

    editor.setValue('');
  }

  return results;
}`;
