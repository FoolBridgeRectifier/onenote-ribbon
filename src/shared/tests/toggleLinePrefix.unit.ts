export const toggleLinePrefixUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Adds bullet prefix to plain line
  editor.setValue('Hello world');
  editor.setCursor({ line: 0, ch: 0 });
  const line1 = editor.getLine(0);
  if (!line1.startsWith('- ')) editor.setLine(0, '- ' + line1);
  results.push({ test: 'adds-bullet-to-plain-line', pass: editor.getValue() === '- Hello world' });

  // T2: Removes bullet prefix
  editor.setValue('- Hello world');
  editor.setCursor({ line: 0, ch: 0 });
  const line2 = editor.getLine(0);
  if (line2.startsWith('- ')) editor.setLine(0, line2.slice(2));
  results.push({ test: 'removes-bullet-prefix', pass: editor.getValue() === 'Hello world' });

  // T3: Checklist variant strips full prefix
  editor.setValue('- [x] Hello world');
  editor.setCursor({ line: 0, ch: 0 });
  const line3 = editor.getLine(0);
  const checklistVariants = ['- [ ] ', '- [x] ', '- [X] ', '- [✔] '];
  let stripped3 = line3;
  for (const v of checklistVariants) {
    if (line3.startsWith(v)) { stripped3 = line3.slice(v.length); break; }
  }
  editor.setLine(0, stripped3);
  results.push({ test: 'strips-full-checklist-prefix', pass: editor.getValue() === 'Hello world' });

  // T4: Prefix replaces existing heading
  editor.setValue('# Heading');
  editor.setCursor({ line: 0, ch: 0 });
  const line4 = editor.getLine(0);
  const stripped4 = line4.replace(/^(#{1,6} |- \\[[ x✔]\\] (?:🔴 |🟡 )?|- |\\d+\\. |> \\[![^\\]]+\\]\\n> )/, '');
  editor.setLine(0, '- ' + stripped4);
  results.push({ test: 'replaces-heading-with-bullet', pass: editor.getValue() === '- Heading' });

  editor.setValue('');
  return results;
}`;
