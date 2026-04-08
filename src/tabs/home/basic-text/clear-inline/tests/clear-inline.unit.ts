export const clearInlineUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Clear inline button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="clear-inline"]');
  results.push({ test: 'clear-inline-exists', pass: !!btn });

  if (editor) {
    // T2: Strips inline bold from current line (preserves heading)
    editor.setValue('## **Bold heading**');
    editor.setCursor({ line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'clear-inline-strips-bold-keeps-heading', pass: editor.getValue() === '## Bold heading' });

    // T3: Strips italic from selection
    editor.setValue('*italic text*');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 13 });
    btn?.click();
    results.push({ test: 'clear-inline-strips-italic', pass: editor.getValue() === 'italic text' });

    // T4: Strips underline
    editor.setValue('<u>underlined</u>');
    editor.setCursor({ line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'clear-inline-strips-underline', pass: editor.getValue() === 'underlined' });

    editor.setValue('');
  }

  return results;
}`;
