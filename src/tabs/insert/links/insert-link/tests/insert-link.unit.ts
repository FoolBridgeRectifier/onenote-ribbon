export const insertLinkUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-link"]');
  results.push({ test: 'insert-link-exists', pass: !!btn });

  if (editor) {
    // With selection
    editor.setValue('my link text');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 12 });
    btn?.click();
    results.push({ test: 'link-wraps-selection', pass: editor.getValue() === '[my link text]()' });

    // Without selection
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'link-inserts-template', pass: editor.getValue() === '[]()' });

    editor.setValue('');
  }

  return results;
}`;
