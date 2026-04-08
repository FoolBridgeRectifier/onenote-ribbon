export const insertFootnoteUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-footnote"]');
  results.push({ test: 'footnote-btn-exists', pass: !!btn });

  if (editor) {
    editor.setValue('My text');
    editor.setCursor({ line: 0, ch: 7 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'footnote-ref-inserted', pass: val.includes('[^1]') });
    results.push({ test: 'footnote-def-at-end', pass: val.endsWith('[^1]: ') || val.endsWith('[^1]:') });
    editor.setValue('');
  }

  return results;
}`;
