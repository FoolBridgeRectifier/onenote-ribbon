export const toggleSubSupUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Insert sub tags at cursor
  editor.setValue('H2O');
  editor.setCursor({ line: 0, ch: 3 });
  editor.replaceRange('<sub></sub>', { line: 0, ch: 3 });
  editor.setCursor({ line: 0, ch: 8 });
  results.push({ test: 'inserts-sub-at-cursor', pass: editor.getValue() === 'H2O<sub></sub>' });

  // T2: Toggle off — cursor inside <sub> strips tags
  editor.setValue('H<sub>2</sub>O');
  editor.setCursor({ line: 0, ch: 7 });
  const line2 = editor.getLine(0);
  const o2 = line2.indexOf('<sub>');
  const c2 = line2.indexOf('</sub>', o2 + 5);
  if (7 > o2 + 4 && 7 < c2 + 6) {
    const inner2 = line2.slice(o2 + 5, c2);
    editor.setLine(0, line2.slice(0, o2) + inner2 + line2.slice(c2 + 6));
  }
  results.push({ test: 'toggle-off-strips-sub-tags', pass: editor.getValue() === 'H2O' });

  // T3: Mutually exclusive — <sub> converts to <sup>
  editor.setValue('x<sub>2</sub>');
  editor.setCursor({ line: 0, ch: 7 });
  const line3 = editor.getLine(0);
  const o3 = line3.indexOf('<sub>');
  const c3 = line3.indexOf('</sub>', o3 + 5);
  const inner3 = line3.slice(o3 + 5, c3);
  editor.setLine(0, line3.slice(0, o3) + '<sup>' + inner3 + '</sup>' + line3.slice(c3 + 6));
  results.push({ test: 'sub-converts-to-sup', pass: editor.getValue() === 'x<sup>2</sup>' });

  editor.setValue('');
  return results;
}`;
