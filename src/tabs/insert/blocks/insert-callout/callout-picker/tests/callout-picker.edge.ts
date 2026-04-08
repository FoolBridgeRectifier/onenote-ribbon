export const calloutPickerEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Clicking a callout type inserts correct notation
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
    const warningBtn = [...document.querySelectorAll('.onr-callout-picker div')].find(b => b.textContent?.trim() === 'warning');
    warningBtn?.click();
    results.push({ test: 'callout-inserts-warning-type', pass: editor.getValue().includes('[!warning]') });

    // Edge 2: Outside click closes picker without inserting
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
    document.body.click(); // outside click
    await new Promise(r => setTimeout(r, 50));
    results.push({ test: 'outside-click-closes-picker', pass: !document.querySelector('.onr-callout-picker') });
    results.push({ test: 'outside-click-no-insertion', pass: editor.getValue() === '' });

    // Edge 3: Picker positioned below callout button
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
    const picker = document.querySelector('.onr-callout-picker') as HTMLElement;
    const calloutBtnRect = (document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]') as HTMLElement)?.getBoundingClientRect();
    if (picker && calloutBtnRect) {
      const pickerTop = parseFloat(picker.style.top);
      results.push({ test: 'picker-below-button', pass: pickerTop > calloutBtnRect.top });
    }
    document.body.click();

    editor.setValue('');
  }

  return results;
}`;
