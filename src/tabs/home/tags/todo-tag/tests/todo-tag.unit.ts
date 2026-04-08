export const todoTagUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="todo-tag"]');
  results.push({ test: 'todo-tag-exists', pass: !!btn });

  if (editor) {
    // T2: Click on plain line adds "- [ ] " prefix
    editor.setValue('My task');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'todo-tag-adds-prefix', pass: editor.getValue() === '- [ ] My task' });

    // T3: Click again removes prefix
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'todo-tag-removes-prefix', pass: editor.getValue() === 'My task' });

    editor.setValue('');
  }

  return results;
}`;
