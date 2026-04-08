export const foldAllUnitTest = `() => {
  const results = [];
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="fold-all"]');
  results.push({ test: 'fold-all-exists', pass: !!btn });
  const cmds = app.commands.listCommands();
  results.push({ test: 'fold-all-command-registered', pass: cmds.some(c => c.id === 'editor:fold-all') });
  return results;
}`;
