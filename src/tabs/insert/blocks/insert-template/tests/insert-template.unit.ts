export const insertTemplateUnitTest = `() => {
  const results = [];

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-template"]');
  results.push({ test: 'insert-template-exists', pass: !!btn });

  // Button is clickable without throwing
  let threw = false;
  try { btn?.click(); } catch(e) { threw = true; }
  results.push({ test: 'insert-template-no-throw', pass: !threw });

  return results;
}`;
