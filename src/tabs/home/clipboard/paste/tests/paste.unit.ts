// Run via: mcp__obsidian-devtools__evaluate_script({ function: pasteUnitTest })
export const pasteUnitTest = `() => {
  const results = [];

  // T1: Paste button element exists with correct data-cmd
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="paste"]');
  results.push({ test: 'paste-button-exists', pass: !!btn });

  // T2: Has onr-btn class
  results.push({ test: 'paste-has-onr-btn', pass: btn?.classList.contains('onr-btn') ?? false });

  // T3: Label text is "Paste"
  const label = btn?.querySelector('.onr-btn-label');
  results.push({ test: 'paste-label', pass: label?.textContent?.trim() === 'Paste' });

  // T4: Has SVG icon
  results.push({ test: 'paste-has-svg', pass: !!btn?.querySelector('svg') });

  return results;
}`;
