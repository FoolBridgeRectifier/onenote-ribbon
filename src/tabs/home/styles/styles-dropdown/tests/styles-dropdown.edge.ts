export const stylesDropdownEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Selecting "Heading 2" on a plain line prefixes with "## "
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]');
    btn?.click();
    const h2Item = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Heading 2');
    h2Item?.click();
    results.push({ test: 'dropdown-applies-h2', pass: editor.getValue() === '## Hello world' });

    // Edge 2: Selecting "Normal" on an H2 line strips the heading
    editor.setValue('## My Heading');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const normalItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Normal');
    normalItem?.click();
    results.push({ test: 'dropdown-normal-strips-heading', pass: editor.getValue() === 'My Heading' });

    editor.setValue('');
  }

  return results;
}`;
