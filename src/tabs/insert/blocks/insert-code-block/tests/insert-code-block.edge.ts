export const insertCodeBlockEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: Multiple code blocks don't interfere
    editor.setValue('\`\`\`\nexisting\n\`\`\`');
    editor.setCursor({ line: 2, ch: 3 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-code-block"]')?.click();
    const val = editor.getValue();
    results.push({ test: 'code-block-after-existing', pass: (val.match(/\`\`\`/g) || []).length >= 4 });

    editor.setValue('');
  }

  return results;
}`;
