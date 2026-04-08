export const insertFootnoteEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: Multi-line note — definition appended at last line
    editor.setValue('Line 1\\nLine 2\\nLine 3');
    editor.setCursor({ line: 1, ch: 3 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-footnote"]')?.click();
    const lines = editor.getValue().split('\\n');
    results.push({ test: 'footnote-def-at-last-line', pass: lines[lines.length - 1].startsWith('[^1]:') });

    // Edge: Footnote ref at insertion point
    results.push({ test: 'footnote-ref-at-cursor', pass: lines[1].includes('[^1]') });

    editor.setValue('');
  }

  return results;
}`;
