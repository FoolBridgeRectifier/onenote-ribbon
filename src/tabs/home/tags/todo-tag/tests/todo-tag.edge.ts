export const todoTagEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Click on existing bullet converts to todo
    editor.setValue('- My bullet');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Home"] [data-cmd="todo-tag"]')?.click();
    results.push({ test: 'todo-tag-replaces-bullet', pass: editor.getValue() === '- [ ] My bullet' });

    // Edge 2: Click on completed "- [x] " removes prefix
    editor.setValue('- [x] Done task');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Home"] [data-cmd="todo-tag"]')?.click();
    // toggleLinePrefix with '- [ ] ' on a '- [x] ' line: hasPrefix check catches [x] variant
    results.push({ test: 'todo-tag-removes-completed', pass: editor.getValue() === 'Done task' });

    editor.setValue('');
  }

  return results;
}`;
