export const findTagsUnitTest = `() => {
  const results = [];

  // T1: Button exists with correct label
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="find-tags"]');
  results.push({ test: 'find-tags-exists', pass: !!btn });
  results.push({ test: 'find-tags-label', pass: btn?.querySelector('.onr-btn-label')?.textContent?.trim() === 'Find Tags' });

  // T2: Click opens global search (side effect: a leaf with search opens)
  btn?.click();
  await new Promise(r => setTimeout(r, 200));
  const hasSearch = !!document.querySelector('.search-view-container, .global-search-container, [data-type="search"]');
  results.push({ test: 'find-tags-opens-search', pass: hasSearch });

  return results;
}`;
