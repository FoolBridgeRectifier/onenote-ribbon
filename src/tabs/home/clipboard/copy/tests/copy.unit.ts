export const copyUnitTest = `() => {
  const results = [];

  // T1: Copy button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="copy"]');
  results.push({ test: 'copy-exists', pass: !!btn });
  results.push({ test: 'copy-label', pass: btn?.querySelector('.onr-btn-label-sm')?.textContent?.trim() === 'Copy' });

  return results;
}`;
