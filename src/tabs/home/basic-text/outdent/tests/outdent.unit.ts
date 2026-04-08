export const outdentUnitTest = `() => {
  const results = [];

  // T1: Outdent button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="outdent"]');
  results.push({ test: 'outdent-exists', pass: !!btn });

  return results;
}`;
