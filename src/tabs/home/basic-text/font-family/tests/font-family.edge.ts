export const fontFamilyEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: With selection → wraps in <span style="font-family:...">
    editor.setValue('Hello world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="font-family"]');
    btn?.click();
    const arialItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Arial');
    arialItem?.click();
    results.push({ test: 'font-family-wraps-selection', pass: editor.getValue().includes('<span style="font-family:Arial">Hello</span>') });

    // Edge 2: Without selection → updates vault config
    editor.setValue('no selection');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const verdanaItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Verdana');
    verdanaItem?.click();
    const config = (app.vault as any).getConfig?.('fontText');
    results.push({ test: 'font-family-sets-vault-config', pass: config === 'Verdana' });

    editor.setValue('');
  }

  return results;
}`;
