export const insertCombinationsTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // Switch to Insert tab
  document.querySelector('[data-tab="Insert"]')?.click();
  await new Promise(r => setTimeout(r, 30));

  const click = (cmd) => document.querySelector(\`[data-panel="Insert"] [data-cmd="\${cmd}"]\`)?.click();
  const val = () => editor.getValue();
  const set = (v, line = 0, ch = 0) => { editor.setValue(v); editor.setCursor({ line, ch }); };
  const sel = (l0, c0, l1, c1) => editor.setSelection({ line: l0, ch: c0 }, { line: l1, ch: c1 });

  // ── BLANK LINE ──
  set('Hello'); click('blank-line');
  results.push({ test: 'blank-line×plain', pass: val() === 'Hello\\n' });

  set(''); click('blank-line');
  results.push({ test: 'blank-line×empty-file', pass: val() === '\\n' });

  // ── TABLE ──
  set(''); click('insert-table');
  results.push({ test: 'table×empty-file', pass: val().includes('| col | col | col |') });

  set('prefix'); set('prefix', 0, 6); click('insert-table');
  results.push({ test: 'table×after-text', pass: val().startsWith('prefix') && val().includes('| col |') });

  // ── ATTACH FILE / EMBED NOTE ──
  set(''); click('attach-file');
  results.push({ test: 'attach-file×inserts-embed', pass: val() === '![[]]' });
  const cursorAfterAttach = editor.getCursor();
  results.push({ test: 'attach-file×cursor-inside', pass: cursorAfterAttach.ch === 3 });

  set(''); click('embed-note');
  results.push({ test: 'embed-note×inserts-embed', pass: val() === '![[]]' });

  // ── IMAGE ──
  set(''); click('insert-image');
  results.push({ test: 'image×inserts-embed', pass: val() === '![[]]' });

  // ── VIDEO ──
  set(''); click('insert-video');
  results.push({ test: 'video×inserts-iframe', pass: val().includes('<iframe') && val().includes('src=""') });

  // ── LINK × no selection ──
  set(''); click('insert-link');
  results.push({ test: 'link×no-selection', pass: val() === '[]()' });
  const cursorNoSel = editor.getCursor();
  results.push({ test: 'link×cursor-inside-brackets', pass: cursorNoSel.ch === 1 });

  // ── LINK × with selection ──
  set('my link'); sel(0, 0, 0, 7); click('insert-link');
  results.push({ test: 'link×selection-wraps', pass: val() === '[my link]()' });

  // ── WIKILINK ──
  set(''); click('insert-wikilink');
  results.push({ test: 'wikilink×inserts', pass: val() === '[[]]' });
  const cursorWiki = editor.getCursor();
  results.push({ test: 'wikilink×cursor-inside', pass: cursorWiki.ch === 2 });

  // ── DATE formats ──
  set(''); click('insert-date');
  results.push({ test: 'date×format', pass: /\\d{4}-\\d{2}-\\d{2}$/.test(val().trim()) });

  set(''); click('insert-time');
  results.push({ test: 'time×format', pass: /\\d{2}:\\d{2}$/.test(val().trim()) });

  set(''); click('insert-datetime');
  results.push({ test: 'datetime×format', pass: /\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}$/.test(val().trim()) });

  // ── CODE BLOCK ──
  set(''); click('insert-code-block');
  results.push({ test: 'code-block×fences', pass: (val().match(/\`\`\`/g) || []).length === 2 });

  // ── MATH ──
  set(''); click('insert-math');
  results.push({ test: 'math×has-dollars', pass: (val().match(/\\$\\$/g) || []).length === 2 });
  const cursorMath = editor.getCursor();
  results.push({ test: 'math×cursor-inside', pass: cursorMath.line === 1 });

  // ── HORIZONTAL RULE ──
  set(''); click('insert-hr');
  results.push({ test: 'hr×inserts', pass: val().includes('---') });

  // ── FOOTNOTE ──
  set('My text'); set('My text', 0, 7); click('insert-footnote');
  const footnoteVal = val();
  results.push({ test: 'footnote×ref-inserted', pass: footnoteVal.includes('[^1]') });
  results.push({ test: 'footnote×def-at-end', pass: footnoteVal.endsWith('[^1]: ') || footnoteVal.endsWith('[^1]:') });

  // ── TAG ──
  set(''); click('insert-tag');
  results.push({ test: 'tag×inserts-hash', pass: val().startsWith('#') });

  // ── CALLOUT (12 types) ──
  const calloutTypes = ['note','abstract','info','tip','success','question','warning','failure','danger','bug','example','quote'];
  for (const type of calloutTypes) {
    set('');
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
    const typeBtn = [...document.querySelectorAll('.onr-callout-picker div')].find(b => b.textContent?.trim() === type);
    typeBtn?.click();
    results.push({ test: \`callout×\${type}-inserts\`, pass: val().includes(\`[!\${type}]\`) });
    editor.setValue('');
  }

  // ── CALLOUT × no selection (cursor positioned correctly) ──
  set('');
  document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
  [...document.querySelectorAll('.onr-callout-picker div')].find(b => b.textContent?.trim() === 'note')?.click();
  results.push({ test: 'callout×note-format', pass: val().startsWith('> [!note]\\n> ') });

  // ── TEMPLATE (no plugin → Notice) ──
  // Can't easily test Notice, but verify no crash
  try {
    set('');
    click('insert-template');
    results.push({ test: 'template×no-crash', pass: true });
  } catch (e) {
    results.push({ test: 'template×no-crash', pass: false, error: e.message });
  }

  // Cleanup
  editor.setValue('');
  document.querySelector('[data-tab="Home"]')?.click();

  return results;
}`;
