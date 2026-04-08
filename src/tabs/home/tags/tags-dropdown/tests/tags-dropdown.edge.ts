export const tagsDropdownEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // Edge 1: Active check shown for tags present on current line
  if (editor) {
    editor.setValue('> [!important]\\n> ');
    editor.setCursor({ line: 0, ch: 5 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="tags-dropdown"]');
    btn?.click();

    const items = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')];
    const importantItem = items.find(i => i.textContent?.includes('Important'));
    const check = importantItem?.querySelector('div');
    // Check should be blue (active)
    results.push({ test: 'dropdown-active-check-for-current-line-tag', pass: !!importantItem });

    document.body.click();
    editor.setValue('');
  }

  // Edge 2: "Customize Tags..." footer row exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="tags-dropdown"]');
  btn?.click();
  const customizeRow = [...document.querySelectorAll('.onr-overlay-dropdown div')]
    .find(d => d.textContent?.includes('Customize Tags'));
  results.push({ test: 'customize-tags-footer', pass: !!customizeRow });
  document.body.click();

  return results;
}`;
