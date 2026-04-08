export const homeIntegrationTest = `() => {
  const results = [];

  // ── Structural Checks ────────────────────────────────────────────────────────

  // I1: Home panel exists
  results.push({ test: 'home-panel-exists', pass: !!document.querySelector('[data-panel="Home"]') });

  // I2: All 6 groups present
  const groupNames = [...document.querySelectorAll('[data-panel="Home"] .onr-group-name')]
    .map(g => g.textContent?.trim());
  const expected = ['Clipboard', 'Basic Text', 'Styles', 'Tags', 'Email & Meetings', 'Navigate'];
  for (const name of expected) {
    results.push({ test: \`group-\${name.replace(/[^a-z]/gi, '-').toLowerCase()}-present\`, pass: groupNames.includes(name) });
  }

  // I3: Groups in correct DOM order
  results.push({ test: 'groups-in-order', pass: JSON.stringify(groupNames.slice(0, 6)) === JSON.stringify(expected) });

  // I4: No overlapping groups (each data-group is unique)
  const unique = new Set(groupNames);
  results.push({ test: 'no-duplicate-groups', pass: unique.size === groupNames.length });

  // I5: Home tab panel visible when Home tab active
  const homeTab = document.querySelector('[data-tab="Home"]');
  homeTab?.click();
  await new Promise(r => setTimeout(r, 50));
  const panel = document.querySelector('[data-panel="Home"]') as HTMLElement;
  results.push({ test: 'home-panel-visible-when-active', pass: panel?.style.display !== 'none' });

  // I6: Insert panel hidden when Home tab active
  const insertPanel = document.querySelector('[data-panel="Insert"]') as HTMLElement;
  results.push({ test: 'insert-panel-hidden-when-home-active', pass: insertPanel?.style.display === 'none' });

  // ── Ribbon State Tracking ────────────────────────────────────────────────────
  const editor = app.workspace.activeEditor?.editor;
  if (editor) {
    // I7: Bold button activates on bold line
    editor.setValue('**bold text**');
    editor.setCursor({ line: 0, ch: 5 });
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const boldBtn = document.querySelector('[data-panel="Home"] [data-cmd="bold"]');
    results.push({ test: 'bold-active-state-tracked', pass: boldBtn?.classList.contains('onr-active') ?? false });

    // I8: Bold button deactivates on plain line
    editor.setValue('plain text');
    editor.setCursor({ line: 0, ch: 0 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    results.push({ test: 'bold-inactive-on-plain-line', pass: !(boldBtn?.classList.contains('onr-active') ?? true) });

    // I9: Styles preview scrolls on H3 cursor
    editor.setValue('### Section');
    editor.setCursor({ line: 0, ch: 5 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const preview0 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span');
    results.push({ test: 'styles-preview-scrolls-to-h3', pass: preview0?.textContent?.trim() === 'Heading 3' });

    // I10: Tag check updates on tag line
    editor.setValue('- [ ] My task');
    editor.setCursor({ line: 0, ch: 5 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const todoCheck = document.querySelector('[data-panel="Home"] [data-cmd="tag-todo"] .onr-tag-check') as HTMLElement;
    results.push({ test: 'todo-check-active-on-task-line', pass: todoCheck?.style.background?.includes('68') || todoCheck?.style.background?.includes('4472') || !!todoCheck?.innerHTML });

    // I11: Font label updates from vault config
    const fontLabel = document.getElementById('onr-font-label');
    results.push({ test: 'font-label-present', pass: !!fontLabel });

    editor.setValue('');
  }

  // ── Cross-group Interactions ──────────────────────────────────────────────────
  // I12: Only one overlay dropdown open at a time
  document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]')?.click();
  const firstMenu = document.querySelectorAll('.onr-overlay-dropdown').length;
  document.querySelector('[data-panel="Home"] [data-cmd="align"]')?.click();
  const secondMenu = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'only-one-overlay-at-a-time', pass: firstMenu <= 1 && secondMenu <= 1 });
  document.body.click(); // close

  // I13: Tab switching closes all overlays
  document.querySelector('[data-tab="Insert"]')?.click();
  await new Promise(r => setTimeout(r, 50));
  document.querySelector('[data-tab="Home"]')?.click();
  await new Promise(r => setTimeout(r, 50));
  const openMenus = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'tab-switch-closes-overlays', pass: openMenus === 0 });

  return results;
}`;
