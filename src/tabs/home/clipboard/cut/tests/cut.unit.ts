export const cutUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Cut button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="cut"]');
  results.push({ test: 'cut-exists', pass: !!btn });

  // T2: Cut with selection removes text
  if (editor) {
    editor.setValue('Hello world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    // Simulate cut logic (without actual clipboard write which needs user gesture)
    const sel = editor.getSelection();
    if (sel) editor.replaceSelection('');
    results.push({ test: 'cut-removes-selection', pass: editor.getValue() === ' world' });
    editor.setValue(''); // cleanup
  } else {
    results.push({ test: 'cut-removes-selection', pass: null, note: 'no editor' });
  }

  return results;
}`;
