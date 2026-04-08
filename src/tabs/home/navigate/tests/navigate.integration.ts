export const navigateIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Home"] [data-group="Navigate"]');
  results.push({ test: 'navigate-group-present', pass: !!group });
  results.push({ test: 'outline-btn', pass: !!group?.querySelector('[data-cmd="outline"]') });
  results.push({ test: 'fold-all-btn', pass: !!group?.querySelector('[data-cmd="fold-all"]') });
  results.push({ test: 'unfold-all-btn', pass: !!group?.querySelector('[data-cmd="unfold-all"]') });
  results.push({ test: 'navigate-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Navigate' });
  return results;
}`;
