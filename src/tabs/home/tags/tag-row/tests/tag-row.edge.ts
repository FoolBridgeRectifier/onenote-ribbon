export const tagRowEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Active check appears when current line has "- [ ] " prefix
    editor.setValue('- [ ] My task');
    editor.setCursor({ line: 0, ch: 5 });
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const todoRow = document.querySelector('[data-panel="Home"] [data-cmd="tag-todo"]');
    const check = todoRow?.querySelector('.onr-tag-check');
    results.push({ test: 'todo-check-active-on-todo-line', pass: check?.style.background === 'rgb(68, 114, 196)' || check?.style.background === '#4472C4' });

    // Edge 2: Check disappears on non-todo line
    editor.setValue('plain text');
    editor.setCursor({ line: 0, ch: 0 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    results.push({ test: 'todo-check-inactive-on-plain-line', pass: check?.style.background === 'rgb(255, 255, 255)' || check?.style.background === '#fff' || check?.style.background === '' });

    editor.setValue('');
  }

  return results;
}`;
