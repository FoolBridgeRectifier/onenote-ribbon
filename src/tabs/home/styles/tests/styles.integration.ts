export const stylesIntegrationTest = `() => {
  const results = [];

  // I1: All sub-component elements present
  results.push({ test: 'preview-0-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"]') });
  results.push({ test: 'preview-1-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-1"]') });
  results.push({ test: 'scroll-up-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]') });
  results.push({ test: 'scroll-down-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-down"]') });
  results.push({ test: 'styles-dropdown-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]') });

  // I2: Group name
  const name = document.querySelector('[data-panel="Home"] [data-group="Styles"] .onr-group-name');
  results.push({ test: 'styles-group-name', pass: name?.textContent?.trim() === 'Styles' });

  // I3: Scroll → preview updates coherently
  const down = document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-down"]');
  const labelBefore = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent;
  down?.click();
  const labelAfter = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent;
  results.push({ test: 'scroll-preview-sync', pass: labelBefore !== labelAfter });

  // Restore
  document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]')?.click();

  return results;
}`;
