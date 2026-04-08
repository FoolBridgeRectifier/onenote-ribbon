export const blocksIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Blocks"]');
  results.push({ test: 'blocks-group-present', pass: !!group });

  const cmds = ['insert-template', 'insert-callout', 'insert-code-block'];
  for (const cmd of cmds) {
    results.push({ test: \`blocks-has-\${cmd}\`, pass: !!group?.querySelector(\`[data-cmd="\${cmd}"]\`) });
  }

  results.push({ test: 'blocks-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Blocks' });
  return results;
}`;
