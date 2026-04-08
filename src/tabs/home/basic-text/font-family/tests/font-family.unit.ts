export const fontFamilyUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Font family picker exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="font-family"]');
  results.push({ test: 'font-family-exists', pass: !!btn });

  // T2: Font label present
  results.push({ test: 'font-family-label-present', pass: !!document.getElementById('onr-font-label') });

  // T3: Click opens dropdown
  btn?.click();
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'font-family-opens-dropdown', pass: items.length > 0 });

  // T4: Contains Arial
  const labels = [...items].map(i => i.textContent?.trim());
  results.push({ test: 'font-family-has-arial', pass: labels.some(l => l === 'Arial') });

  // Cleanup
  document.body.click();

  return results;
}`;
