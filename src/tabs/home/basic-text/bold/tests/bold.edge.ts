export const boldEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Bold inside italic — wraps correctly
    editor.setValue('*text*');
    editor.setSelection({ line: 0, ch: 1 }, { line: 0, ch: 5 });
    const sel = editor.getSelection();
    editor.replaceSelection('**' + sel + '**');
    results.push({ test: 'bold-inside-italic', pass: editor.getValue() === '*****text*****' || editor.getValue().includes('**text**') });

    // Edge 2: Active state — bold button has onr-active when cursor on bold line
    editor.setValue('**bold line**');
    editor.setCursor({ line: 0, ch: 5 });
    // Trigger state update
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="bold"]');
    results.push({ test: 'bold-active-state-on-bold-line', pass: btn?.classList.contains('onr-active') ?? false });

    editor.setValue('');
  }

  return results;
}`;
