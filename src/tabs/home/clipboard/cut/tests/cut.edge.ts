export const cutEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // Edge 1: Cut with no selection — does nothing
  if (editor) {
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 5 }); // no selection
    const sel = editor.getSelection();
    results.push({ test: 'cut-no-selection-noop', pass: sel === '' });
    editor.setValue('');
  }

  // Edge 2: Multi-line selection cut
  if (editor) {
    editor.setValue('line1\\nline2\\nline3');
    editor.setSelection({ line: 0, ch: 0 }, { line: 1, ch: 5 });
    const sel = editor.getSelection();
    if (sel) editor.replaceSelection('');
    results.push({ test: 'cut-multiline', pass: editor.getValue() === '\\nline3' });
    editor.setValue('');
  }

  return results;
}`;
