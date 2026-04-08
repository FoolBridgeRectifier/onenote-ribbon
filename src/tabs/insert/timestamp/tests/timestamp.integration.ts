export const timestampIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Time Stamp"]');
  results.push({ test: 'timestamp-group-present', pass: !!group });

  const cmds = ['insert-date', 'insert-time', 'insert-datetime'];
  for (const cmd of cmds) {
    results.push({ test: \`timestamp-has-\${cmd}\`, pass: !!group?.querySelector(\`[data-cmd="\${cmd}"]\`) });
  }

  results.push({ test: 'timestamp-3-buttons', pass: group?.querySelectorAll('.onr-btn').length === 3 });
  return results;
}`;
