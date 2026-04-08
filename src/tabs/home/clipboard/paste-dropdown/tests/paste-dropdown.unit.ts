export const pasteDropdownUnitTest = `() => {
  const results = [];

  // T1: Clicking paste-dropdown shows overlay menu
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]');
  results.push({ test: 'paste-dropdown-exists', pass: !!btn });

  // T2: No overlay before click
  const before = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'no-overlay-before-click', pass: before === 0 });

  // T3: Simulate click — menu should appear
  btn?.click();
  const after = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'overlay-appears-on-click', pass: after > 0 });

  // T4: Menu has 3 items (Paste, Paste as Plain Text, Paste Special)
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'paste-dropdown-3-items', pass: items.length === 3 });

  // Cleanup
  document.body.click();
  return results;
}`;
