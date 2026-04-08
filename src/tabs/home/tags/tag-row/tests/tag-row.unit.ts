export const tagRowUnitTest = `() => {
  const results = [];

  // T1: 3 tag rows present (To Do, Important, Question)
  const rows = document.querySelectorAll('[data-panel="Home"] .onr-tag-row');
  results.push({ test: 'three-tag-rows', pass: rows.length === 3 });

  // T2: First row is "To Do"
  const firstLabel = rows[0]?.querySelector('.onr-tag-label')?.textContent?.trim();
  results.push({ test: 'first-row-todo', pass: firstLabel === 'To Do' });

  // T3: Second row is "Important"
  const secondLabel = rows[1]?.querySelector('.onr-tag-label')?.textContent?.trim();
  results.push({ test: 'second-row-important', pass: secondLabel === 'Important' });

  // T4: Each row has a check box
  const checks = document.querySelectorAll('[data-panel="Home"] .onr-tag-check');
  results.push({ test: 'three-check-boxes', pass: checks.length >= 3 });

  return results;
}`;
