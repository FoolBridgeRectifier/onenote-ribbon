export const tagsDropdownUnitTest = `() => {
  const results = [];

  // T1: Dropdown arrow exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="tags-dropdown"]');
  results.push({ test: 'tags-dropdown-btn-exists', pass: !!btn });

  // T2: Click opens overlay
  btn?.click();
  const overlay = document.querySelector('.onr-overlay-dropdown');
  results.push({ test: 'dropdown-opens', pass: !!overlay });

  // T3: Has 29 tag items (ALL_TAGS) + 1 divider + 1 customize = 31 children ish
  const children = overlay?.children.length ?? 0;
  results.push({ test: 'dropdown-has-many-items', pass: children >= 29 });

  // T4: First item is "To Do"
  const items = overlay?.querySelectorAll('.onr-dd-item');
  const firstLabel = items?.[0]?.querySelector('span:nth-child(2)')?.textContent?.trim();
  results.push({ test: 'first-item-todo', pass: firstLabel === 'To Do' });

  // Cleanup
  document.body.click();
  return results;
}`;
