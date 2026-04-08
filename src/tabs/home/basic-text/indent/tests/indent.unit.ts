export const indentUnitTest = `() => {
  const results = [];

  // T1: Indent button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="indent"]');
  results.push({ test: 'indent-exists', pass: !!btn });

  return results;
}`;
