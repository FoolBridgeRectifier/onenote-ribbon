export const stylesPreviewEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Cursor on H3 line — ribbon state update scrolls preview to show H3
    editor.setValue('### Section Title');
    editor.setCursor({ line: 0, ch: 5 });
    // Trigger updateRibbonState
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const card0 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"]');
    const span0 = card0?.querySelector('span');
    // After H3 cursor, offset should be 2 → first card = Heading 3
    results.push({ test: 'h3-cursor-scrolls-preview', pass: span0?.textContent?.trim() === 'Heading 3' });

    // Edge 2: H3 card gets active state
    results.push({ test: 'h3-card-active', pass: card0?.classList.contains('onr-active') ?? false });

    // Edge 3: Click first card on H3 line — no prefix change (already H3)
    card0?.click();
    results.push({ test: 'click-same-style-noop', pass: editor.getValue() === '### Section Title' });

    editor.setValue('');
  }

  return results;
}`;
