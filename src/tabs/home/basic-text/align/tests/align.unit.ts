export const alignUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Align button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="align"]');
  results.push({ test: 'align-exists', pass: !!btn });

  // T2: Click opens dropdown with 4 options
  btn?.click();
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'align-4-options', pass: items.length === 4 });

  // T3: Correct labels
  const labels = [...items].map(i => i.textContent?.trim().replace(/\\s+/g, ' '));
  results.push({ test: 'align-has-left', pass: labels.some(l => l?.includes('Left')) });
  results.push({ test: 'align-has-center', pass: labels.some(l => l?.includes('Center')) });

  // Cleanup
  document.body.click();
  return results;
}`;
