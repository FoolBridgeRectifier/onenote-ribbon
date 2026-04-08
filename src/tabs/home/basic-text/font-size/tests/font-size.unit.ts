export const fontSizeUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Font size picker exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="font-size"]');
  results.push({ test: 'font-size-exists', pass: !!btn });

  // T2: Size label present
  results.push({ test: 'font-size-label-present', pass: !!document.getElementById('onr-size-label') });

  // T3: Click opens dropdown
  btn?.click();
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'font-size-opens-dropdown', pass: items.length > 0 });

  // T4: Contains size 16
  const labels = [...items].map(i => i.textContent?.trim());
  results.push({ test: 'font-size-has-16', pass: labels.some(l => l === '16') });

  // Cleanup
  document.body.click();

  if (editor) {
    // T5: With selection wraps in span
    editor.setValue('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    btn?.click();
    const item24 = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === '24');
    item24?.click();
    results.push({ test: 'font-size-wraps-selection', pass: editor.getValue().includes('<span style="font-size:24px">hello</span>') });

    editor.setValue('');
  }

  return results;
}`;
