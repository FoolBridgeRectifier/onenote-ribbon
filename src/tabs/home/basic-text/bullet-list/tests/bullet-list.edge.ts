export const bulletListEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Toggle bullet off on a checked checkbox — strips "- [x] " not just "- "
    editor.setValue('- [x] Hello');
    editor.setCursor({ line: 0, ch: 0 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="bullet-list"]');
    btn?.click();
    results.push({ test: 'bullet-strips-full-checklist-prefix', pass: editor.getValue() === 'Hello' });

    // Edge 2: Toggle bullet off on "- [✔] " variant
    editor.setValue('- [✔] Task done');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bullet-strips-checkmark-variant', pass: editor.getValue() === 'Task done' });

    // Edge 3: Toggle bullet on a heading line strips heading
    editor.setValue('# My Heading');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bullet-replaces-heading', pass: editor.getValue() === '- My Heading' });

    editor.setValue('');
  }

  return results;
}`;
