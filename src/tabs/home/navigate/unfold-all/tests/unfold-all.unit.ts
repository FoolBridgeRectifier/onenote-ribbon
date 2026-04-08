export const unfoldAllUnitTest = `() => {
  const results = [];
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="unfold-all"]');
  results.push({ test: 'unfold-all-exists', pass: !!btn });
  const cmds = app.commands.listCommands();
  results.push({ test: 'unfold-all-command-registered', pass: cmds.some(c => c.id === 'editor:unfold-all') });
  return results;
}`;
