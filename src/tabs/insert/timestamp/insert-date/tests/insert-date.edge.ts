export const insertDateEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: moment available → uses moment format
    const m = (window as any).moment;
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-date"]')?.click();
    const val = editor.getValue().trim();
    if (m) {
      results.push({ test: 'date-uses-moment', pass: val === m().format('YYYY-MM-DD') });
    } else {
      // Fallback: native Date
      const today = new Date();
      const expected = \`\${today.getFullYear()}-\${String(today.getMonth()+1).padStart(2,'0')}-\${String(today.getDate()).padStart(2,'0')}\`;
      results.push({ test: 'date-uses-native-fallback', pass: val === expected });
    }

    // Edge: date+time inserted together
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-datetime"]')?.click();
    const dtVal = editor.getValue().trim();
    results.push({ test: 'datetime-contains-date-and-time', pass: /\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}/.test(dtVal) });

    editor.setValue('');
  }

  return results;
}`;
