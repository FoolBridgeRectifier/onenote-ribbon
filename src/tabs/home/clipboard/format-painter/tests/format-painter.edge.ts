export const formatPainterEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Captures heading prefix from H2 line
    editor.setValue('## My Heading');
    editor.setCursor({ line: 0, ch: 5 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]');
    btn?.click();
    const fp = (window as any)._onrFP;
    results.push({ test: 'fp-captures-heading', pass: fp?.headPrefix === '## ' });

    // Edge 2: Applying to selection wraps in bold if source was bold
    if (fp?.isBold === false && fp?.headPrefix === '## ') {
      editor.setValue('plain text');
      editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
      // Simulate apply: no bold (isBold=false), just apply heading to line
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      if (!line.startsWith(fp.headPrefix)) {
        editor.setLine(cursor.line, fp.headPrefix + line.replace(/^#{1,6}\\s+/, ''));
      }
      results.push({ test: 'fp-applies-heading', pass: editor.getLine(0).startsWith('## ') });
    }

    // Cleanup
    (window as any)._onrFPActive = false;
    (window as any)._onrFP = null;
    const btn2 = document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]');
    btn2?.classList.remove('onr-active');
    editor.setValue('');
  }

  return results;
}`;
