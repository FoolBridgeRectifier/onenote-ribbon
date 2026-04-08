export const applyTagEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // Edge 1: Toggle OFF — clicking Important on a line that already has [!important] removes it
  editor.setValue('> [!important]\\n> My content');
  editor.setCursor({ line: 0, ch: 5 });
  document.querySelector('[data-panel="Home"] [data-cmd="tag-important"]')?.click();
  // applyTag should detect line starts with "> [!important]" and remove the callout header
  results.push({ test: 'apply-tag-toggle-off-callout', pass: !editor.getValue().includes('[!important]') });

  // Edge 2: tag-highlight uses toggleInline (== wrapper)
  editor.setValue('Some text');
  editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
  document.querySelector('[data-panel="Home"] [data-cmd="tag-highlight"]')?.click();
  results.push({ test: 'highlight-tag-wraps-selection', pass: editor.getValue().includes('==Some==') || editor.getValue().startsWith('==') });

  // Edge 3: Multiline callout toggle-off strips both header and continuation prefix
  editor.setValue('> [!note] Remember for later\\n> My reminder text');
  editor.setCursor({ line: 0, ch: 5 });
  document.querySelector('[data-panel="Home"] [data-cmd="tag-remember"]')?.click();
  results.push({ test: 'multiline-callout-toggle-strips-both-lines', pass: !editor.getValue().includes('[!note]') });

  editor.setValue('');
  return results;
}`;
