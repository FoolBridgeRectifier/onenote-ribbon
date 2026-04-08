export const insertVideoUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-video"]');
  results.push({ test: 'insert-video-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'insert-video-has-iframe', pass: val.includes('<iframe') });
    results.push({ test: 'insert-video-has-src', pass: val.includes('src=""') });
    results.push({ test: 'insert-video-has-allowfullscreen', pass: val.includes('allowfullscreen') });
    editor.setValue('');
  }

  return results;
}`;
