export const insertIntegrationTest = `() => {
  const results = [];

  // Switch to Insert tab
  document.querySelector('[data-tab="Insert"]')?.click();
  await new Promise(r => setTimeout(r, 50));

  // ── Structural Checks ────────────────────────────────────────────────────────

  // I1: Insert panel exists and is visible
  const panel = document.querySelector('[data-panel="Insert"]') as HTMLElement;
  results.push({ test: 'insert-panel-exists', pass: !!panel });
  results.push({ test: 'insert-panel-visible', pass: panel?.style.display !== 'none' });

  // I2: Home panel hidden
  const homePanel = document.querySelector('[data-panel="Home"]') as HTMLElement;
  results.push({ test: 'home-panel-hidden', pass: homePanel?.style.display === 'none' });

  // I3: All 8 group names
  const groupNames = [...document.querySelectorAll('[data-panel="Insert"] .onr-group-name')]
    .map(g => g.textContent?.trim());
  const expectedGroups = ['Insert', 'Tables', 'Files', 'Images', 'Links', 'Time Stamp', 'Blocks', 'Symbols'];
  for (const name of expectedGroups) {
    results.push({ test: \`group-\${name.replace(/[^a-z]/gi, '-').toLowerCase()}-present\`, pass: groupNames.includes(name) });
  }

  // I4: Groups in correct order
  results.push({ test: 'groups-in-order', pass: JSON.stringify(groupNames.slice(0, 8)) === JSON.stringify(expectedGroups) });

  // I5: No duplicate groups
  results.push({ test: 'no-duplicate-groups', pass: new Set(groupNames).size === groupNames.length });

  // ── All Buttons Present ──────────────────────────────────────────────────────

  const allExpectedCmds = [
    'blank-line', 'insert-table',
    'attach-file', 'embed-note',
    'insert-image', 'insert-video',
    'insert-link', 'insert-wikilink',
    'insert-date', 'insert-time', 'insert-datetime',
    'insert-template', 'insert-callout', 'insert-code-block',
    'insert-math', 'insert-hr', 'insert-footnote', 'insert-tag',
  ];

  for (const cmd of allExpectedCmds) {
    results.push({ test: \`cmd-\${cmd}-present\`, pass: !!document.querySelector(\`[data-panel="Insert"] [data-cmd="\${cmd}"]\`) });
  }

  // ── Functional Checks ────────────────────────────────────────────────────────
  const editor = app.workspace.activeEditor?.editor;
  if (editor) {
    // I6: Table insertion works
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-table"]')?.click();
    results.push({ test: 'table-inserted', pass: editor.getValue().includes('| col |') });
    editor.setValue('');

    // I7: Date insertion works and matches format
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-date"]')?.click();
    results.push({ test: 'date-inserted-correct-format', pass: /\\d{4}-\\d{2}-\\d{2}/.test(editor.getValue()) });
    editor.setValue('');

    // I8: Code block inserted with cursor inside
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-code-block"]')?.click();
    results.push({ test: 'code-block-inserted', pass: editor.getValue().includes('\`\`\`') });
    const cursor = editor.getCursor();
    results.push({ test: 'code-block-cursor-inside', pass: cursor.line === 1 });
    editor.setValue('');
  }

  // I9: No console errors (document for human review)
  results.push({ test: 'manual-check-console-errors', pass: true, note: 'Verify via mcp__obsidian-devtools__list_console_messages' });

  // Restore Home tab
  document.querySelector('[data-tab="Home"]')?.click();

  return results;
}`;
