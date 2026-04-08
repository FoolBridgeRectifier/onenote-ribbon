export const fontColorUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Font color button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="font-color"]');
  results.push({ test: 'font-color-exists', pass: !!btn });

  // T2: Color swatch present
  results.push({ test: 'font-color-swatch-present', pass: !!document.getElementById('onr-color-swatch') });

  // T3: Click opens dropdown
  btn?.click();
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'font-color-opens-dropdown', pass: items.length > 0 });

  // Cleanup
  document.body.click();

  return results;
}`;
