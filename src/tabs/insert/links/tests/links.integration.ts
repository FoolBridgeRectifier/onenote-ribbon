export const linksIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Links"]');
  results.push({ test: 'links-group-present', pass: !!group });
  results.push({ test: 'links-has-link-btn', pass: !!group?.querySelector('[data-cmd="insert-link"]') });
  results.push({ test: 'links-has-wikilink-btn', pass: !!group?.querySelector('[data-cmd="insert-wikilink"]') });
  results.push({ test: 'links-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Links' });
  results.push({ test: 'links-2-buttons', pass: group?.querySelectorAll('.onr-btn').length === 2 });
  return results;
}`;
