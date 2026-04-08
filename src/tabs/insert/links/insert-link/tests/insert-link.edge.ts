export const insertLinkEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: cursor positioned correctly after insertion
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-link"]')?.click();
    // Cursor should be at ch=1 (inside the brackets [|])
    const cursor = editor.getCursor();
    results.push({ test: 'link-cursor-inside-brackets', pass: cursor.ch === 1 });

    // Edge: with selection, cursor at end before closing paren
    editor.setValue('Selected');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-link"]')?.click();
    const cursor2 = editor.getCursor();
    // cursor should be just before ) in [Selected]()
    results.push({ test: 'link-cursor-before-close-paren', pass: cursor2.ch === editor.getValue().length - 1 });

    editor.setValue('');
  }

  return results;
}`;
