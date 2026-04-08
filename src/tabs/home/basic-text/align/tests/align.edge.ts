export const alignEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Align Left wraps selection in div with text-align:left
    editor.setValue('My paragraph');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 12 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="align"]');
    btn?.click();
    const leftItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.includes('Left'));
    leftItem?.click();
    results.push({ test: 'align-left-wraps-div', pass: editor.getValue().includes('text-align:left') });

    // Edge 2: Align with no selection wraps current line
    editor.setValue('single line');
    editor.setCursor({ line: 0, ch: 5 });
    btn?.click();
    const centerItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.includes('Center'));
    centerItem?.click();
    results.push({ test: 'align-center-wraps-line', pass: editor.getValue().includes('text-align:center') });

    editor.setValue('');
  }

  return results;
}`;
