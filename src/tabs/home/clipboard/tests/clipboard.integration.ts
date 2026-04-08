// Run via: mcp__obsidian-devtools__evaluate_script({ function: clipboardIntegrationTest })
export const clipboardIntegrationTest = `() => {
  const results = [];

  // I1: All 5 clipboard commands exist in DOM
  const cmds = ['paste', 'paste-dropdown', 'cut', 'copy', 'format-painter'];
  for (const cmd of cmds) {
    const el = document.querySelector(\`[data-panel="Home"] [data-cmd="\${cmd}"]\`);
    results.push({ test: \`clipboard-\${cmd}-present\`, pass: !!el });
  }

  // I2: Clipboard group name
  const name = document.querySelector('[data-panel="Home"] [data-group="Clipboard"] .onr-group-name');
  results.push({ test: 'clipboard-group-name', pass: name?.textContent?.trim() === 'Clipboard' });

  // I3: Layout — Paste is taller than Cut/Copy/Format Painter
  const paste = document.querySelector('[data-panel="Home"] [data-cmd="paste"]') as HTMLElement;
  const cut = document.querySelector('[data-panel="Home"] [data-cmd="cut"]') as HTMLElement;
  if (paste && cut) {
    results.push({
      test: 'paste-taller-than-cut',
      pass: paste.getBoundingClientRect().height > cut.getBoundingClientRect().height,
    });
  }

  return results;
}`;
