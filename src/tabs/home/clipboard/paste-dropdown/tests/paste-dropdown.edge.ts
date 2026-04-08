export const pasteDropdownEdgeTests = `() => {
  const results = [];

  // Edge 1: "Paste Special" is disabled
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]');
  btn?.click();
  const items = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')];
  const pasteSpecial = items.find(i => i.textContent?.includes('Paste Special'));
  results.push({ test: 'paste-special-disabled-cursor', pass: pasteSpecial?.style.cursor === 'default' });

  // Edge 2: Click outside closes menu
  document.body.click();
  const menus = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'outside-click-closes', pass: menus === 0 });

  return results;
}`;
