export const calloutPickerUnitTest = `() => {
  const results = [];

  // T1: Callout button exists
  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]');
  results.push({ test: 'callout-btn-exists', pass: !!btn });

  // T2: No picker before click
  results.push({ test: 'no-picker-before-click', pass: !document.querySelector('.onr-callout-picker') });

  // T3: Click opens picker
  btn?.click();
  results.push({ test: 'picker-opens-on-click', pass: !!document.querySelector('.onr-callout-picker') });

  // T4: Picker has 12 types
  const pickerBtns = document.querySelectorAll('.onr-callout-picker div');
  results.push({ test: 'picker-has-12-types', pass: pickerBtns.length === 12 });

  // T5: All expected types present
  const types = ['note','abstract','info','tip','success','question','warning','failure','danger','bug','example','quote'];
  const pickerTexts = [...pickerBtns].map(b => b.textContent?.trim().toLowerCase());
  for (const t of types) {
    results.push({ test: \`picker-has-\${t}\`, pass: pickerTexts.includes(t) });
  }

  // Cleanup
  document.body.click();
  return results;
}`;
