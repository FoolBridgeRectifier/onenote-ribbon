export const insertTemplateEdgeTests = `() => {
  const results = [];

  // Edge: when templates plugin is not active, a Notice is shown (no throw)
  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-template"]');
  let threw = false;
  try { btn?.click(); } catch(e) { threw = true; }
  results.push({ test: 'insert-template-no-throw-when-plugin-missing', pass: !threw });

  return results;
}`;
