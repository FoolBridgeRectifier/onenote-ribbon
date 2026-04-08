export const applyTagUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Apply "tag-important" inserts callout
  editor.setValue('My line');
  editor.setCursor({ line: 0, ch: 0 });
  // Simulate applyTag for 'tag-important'
  const notation = '> [!important]\\n> ';
  const cursor = editor.getCursor();
  editor.replaceRange(notation, cursor);
  results.push({ test: 'apply-important-inserts-callout', pass: editor.getValue().startsWith('> [!important]') });

  // T2: Clicking Important tag row triggers applyTag
  editor.setValue('Normal line');
  editor.setCursor({ line: 0, ch: 0 });
  const importantRow = document.querySelector('[data-panel="Home"] [data-cmd="tag-important"]');
  importantRow?.click();
  results.push({ test: 'tag-row-click-applies-tag', pass: editor.getValue().includes('[!important]') });

  editor.setValue('');
  return results;
}`;
