export const stylesDropdownUnitTest = `() => {
  const results = [];

  // T1: Click dropdown button opens menu
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]');
  btn?.click();
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'dropdown-opens', pass: items.length > 0 });

  // T2: All 11 style options present
  results.push({ test: 'dropdown-11-items', pass: items.length === 11 });

  // T3: Includes "Heading 1" and "Normal"
  const labels = [...items].map(i => i.textContent?.trim());
  results.push({ test: 'has-heading-1', pass: labels.includes('Heading 1') });
  results.push({ test: 'has-normal', pass: labels.includes('Normal') });

  // Cleanup
  document.body.click();
  return results;
}`;
