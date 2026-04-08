export const basicTextIntegrationTest = `() => {
  const results = [];

  // I1: All buttons in row 1 present
  const row1Cmds = ['font-family', 'font-size', 'bullet-list', 'numbered-list', 'outdent', 'indent', 'clear-formatting'];
  for (const cmd of row1Cmds) {
    const el = document.querySelector(\`[data-panel="Home"] [data-cmd="\${cmd}"]\`);
    results.push({ test: \`r1-\${cmd}\`, pass: !!el });
  }

  // I2: All buttons in row 2 present
  const row2Cmds = ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'highlight', 'font-color', 'align', 'clear-inline'];
  for (const cmd of row2Cmds) {
    const el = document.querySelector(\`[data-panel="Home"] [data-cmd="\${cmd}"]\`);
    results.push({ test: \`r2-\${cmd}\`, pass: !!el });
  }

  // I3: Group name
  const name = document.querySelector('[data-panel="Home"] [data-group="Basic Text"] .onr-group-name');
  results.push({ test: 'basic-text-group-name', pass: name?.textContent?.trim() === 'Basic Text' });

  // I4: Two rows exist
  const rows = document.querySelectorAll('[data-panel="Home"] [data-group="Basic Text"] .onr-row');
  results.push({ test: 'basic-text-two-rows', pass: rows.length === 2 });

  // I5: Highlight swatch present
  results.push({ test: 'highlight-swatch-present', pass: !!document.getElementById('onr-highlight-swatch') });

  // I6: Color swatch present
  results.push({ test: 'color-swatch-present', pass: !!document.getElementById('onr-color-swatch') });

  return results;
}`;
