export const symbolsIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Symbols"]');
  results.push({ test: 'symbols-group-present', pass: !!group });

  const cmds = ['insert-math', 'insert-hr', 'insert-footnote', 'insert-tag'];
  for (const cmd of cmds) {
    results.push({ test: \`symbols-has-\${cmd}\`, pass: !!group?.querySelector(\`[data-cmd="\${cmd}"]\`) });
  }

  results.push({ test: 'symbols-4-buttons', pass: group?.querySelectorAll('.onr-btn').length === 4 });
  return results;
}`;
