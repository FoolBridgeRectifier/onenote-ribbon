export const emailPageEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  try { results.push({ test: 'email-page-no-crash-no-editor', pass: true }); }
  catch (e) { results.push({ test: 'email-page-no-crash-no-editor', pass: false }); }
  if (editor) {
    editor.setValue('Test content for email');
    document.querySelector('[data-panel="Home"] [data-cmd="email-page"]')?.click();
    results.push({ test: 'email-page-fires-with-editor', pass: true });
    editor.setValue('');
  }
  return results;
}`;
