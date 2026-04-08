export const toggleInlineUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Wraps selection in bold
  editor.setValue('hello world');
  editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
  const sel1 = editor.getSelection();
  if (sel1) editor.replaceSelection(\`**\${sel1}**\`);
  results.push({ test: 'wraps-selection-in-bold', pass: editor.getValue() === '**hello** world' });

  // T2: Unwraps existing bold
  editor.setValue('**hello** world');
  editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
  const sel2 = editor.getSelection();
  if (sel2.startsWith('**') && sel2.endsWith('**')) editor.replaceSelection(sel2.slice(2, -2));
  results.push({ test: 'unwraps-existing-bold', pass: editor.getValue() === 'hello world' });

  // T3: No selection inserts pair at cursor
  editor.setValue('hello');
  editor.setCursor({ line: 0, ch: 5 });
  editor.replaceRange('====', { line: 0, ch: 5 });
  editor.setCursor({ line: 0, ch: 7 });
  results.push({ test: 'no-selection-inserts-pair', pass: editor.getValue() === 'hello====' });

  editor.setValue('');
  return results;
}`;
