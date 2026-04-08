export const tablesIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Tables"]');
  results.push({ test: 'tables-group-present', pass: !!group });
  results.push({ test: 'tables-has-table-btn', pass: !!group?.querySelector('[data-cmd="insert-table"]') });
  results.push({ test: 'tables-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Tables' });
  return results;
}`;
