export const subscriptEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: cursor inside <sup> then click subscript → converts to <sub>
    editor.setValue('x<sup>2</sup>');
    editor.setCursor({ line: 0, ch: 7 }); // inside <sup>
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="subscript"]');
    btn?.click();
    results.push({ test: 'sub-converts-sup', pass: editor.getValue() === 'x<sub>2</sub>' });

    // Edge: cursor outside any span → inserts <sub></sub>
    editor.setValue('H2O');
    editor.setCursor({ line: 0, ch: 3 });
    btn?.click();
    results.push({ test: 'sub-inserts-at-cursor', pass: editor.getValue() === 'H2O<sub></sub>' });

    editor.setValue('');
  }

  return results;
}`;
