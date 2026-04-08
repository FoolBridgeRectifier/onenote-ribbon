export const insertCalloutUnitTest = `() => {
  const results = [];

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]');
  results.push({ test: 'insert-callout-exists', pass: !!btn });

  // Click opens picker
  btn?.click();
  results.push({ test: 'callout-opens-picker', pass: !!document.querySelector('.onr-callout-picker') });

  // Cleanup
  document.body.click();

  return results;
}`;
