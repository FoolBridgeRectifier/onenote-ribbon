export const outlineUnitTest = `() => {
  const results = [];
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="outline"]');
  results.push({ test: 'outline-exists', pass: !!btn });
  const cmds = app.commands.listCommands();
  results.push({ test: 'outline-command-exists', pass: cmds.some(c => c.id === 'outline:open') });
  return results;
}`;
