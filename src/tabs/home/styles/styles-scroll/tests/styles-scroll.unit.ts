export const stylesScrollUnitTest = `() => {
  const results = [];

  // T1: Up/Down/dropdown buttons exist
  const up = document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]');
  const down = document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-down"]');
  const drop = document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]');
  results.push({ test: 'scroll-up-exists', pass: !!up });
  results.push({ test: 'scroll-down-exists', pass: !!down });
  results.push({ test: 'styles-dropdown-exists', pass: !!drop });

  // T2: Scroll down changes first card label
  const card0Before = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  down?.click();
  const card0After = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  results.push({ test: 'scroll-down-changes-label', pass: card0After !== card0Before });

  // T3: Scroll up restores original label
  up?.click();
  const card0Restored = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  results.push({ test: 'scroll-up-restores-label', pass: card0Restored === card0Before });

  // T4: Scroll up at top clamps (no negative offset)
  up?.click(); // try to go before 0
  const card0Clamped = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  results.push({ test: 'scroll-clamps-at-top', pass: card0Clamped === 'Heading 1' });

  return results;
}`;
