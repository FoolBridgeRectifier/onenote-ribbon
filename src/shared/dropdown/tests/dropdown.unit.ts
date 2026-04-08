export const dropdownUnitTest = `() => {
  const results = [];

  // T1: Dropdown renders on anchor
  const anchor = document.createElement('div');
  anchor.style.cssText = 'position:fixed;top:100px;left:100px;width:80px;height:24px';
  document.body.appendChild(anchor);
  const items = [{ label: 'Option A', action: () => {} }, { label: 'Option B', action: () => {} }];
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchor, items);
  const el = document.querySelector('.onr-overlay-dropdown');
  results.push({ test: 'dropdown-renders-on-anchor', pass: !!el });
  anchor.remove();

  // T2: Correct item count inside menu
  const menu = document.querySelector('.onr-overlay-dropdown');
  const itemCount = menu?.querySelectorAll('.onr-dd-item').length ?? 0;
  results.push({ test: 'dropdown-item-count', pass: itemCount === 2 });

  // T3: Outside click closes dropdown
  document.body.click();
  const afterClose = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'outside-click-closes', pass: afterClose === 0 });

  return results;
}`;
