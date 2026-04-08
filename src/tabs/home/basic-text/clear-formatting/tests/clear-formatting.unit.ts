export const clearFormattingUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Clear formatting button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="clear-formatting"]');
  results.push({ test: 'clear-formatting-exists', pass: !!btn });

  if (editor) {
    // T2: Strips heading prefix
    editor.setValue('## My Heading');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'clear-formatting-strips-heading', pass: editor.getValue() === 'My Heading' });

    // T3: Strips inline bold from selection
    editor.setValue('**bold text**');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 13 });
    btn?.click();
    results.push({ test: 'clear-formatting-strips-bold', pass: editor.getValue() === 'bold text' });

    // T4: Strips strikethrough
    editor.setValue('~~struck~~');
    editor.setCursor({ line: 0, ch: 3 });
    btn?.click();
    results.push({ test: 'clear-formatting-strips-strikethrough', pass: editor.getValue() === 'struck' });

    editor.setValue('');
  }

  return results;
}`;
