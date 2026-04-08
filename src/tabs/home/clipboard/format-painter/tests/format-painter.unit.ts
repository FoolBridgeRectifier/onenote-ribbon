export const formatPainterUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]');
  results.push({ test: 'fp-exists', pass: !!btn });

  if (editor) {
    // T2: Click activates (sets _onrFPActive and adds onr-active class)
    editor.setValue('**Bold line**');
    editor.setCursor({ line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'fp-active-flag', pass: !!(window as any)._onrFPActive });
    results.push({ test: 'fp-active-class', pass: btn?.classList.contains('onr-active') ?? false });

    // T3: Captured format includes isBold: true
    const fp = (window as any)._onrFP;
    results.push({ test: 'fp-captures-bold', pass: fp?.isBold === true });

    // Cleanup: click again to deactivate
    btn?.click();
    results.push({ test: 'fp-deactivated', pass: !(window as any)._onrFPActive });
    editor.setValue('');
  }

  return results;
}`;
