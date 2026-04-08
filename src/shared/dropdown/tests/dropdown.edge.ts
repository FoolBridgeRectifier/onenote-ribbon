export const dropdownEdgeTests = `() => {
  const results = [];

  // Edge 1: >15 items — max-height + overflow-y:auto
  const anchor1 = document.createElement('div');
  anchor1.style.cssText = 'position:fixed;top:100px;left:100px;width:80px;height:24px';
  document.body.appendChild(anchor1);
  const manyItems = Array.from({length: 16}, (_, i) => ({ label: \`Option \${i}\`, action: () => {} }));
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchor1, manyItems);
  const menu1 = document.querySelector('.onr-overlay-dropdown');
  if (menu1) {
    results.push({ test: 'scroll-max-height-on-16-items', pass: !!menu1.style.maxHeight && parseInt(menu1.style.maxHeight) > 0 });
    results.push({ test: 'scroll-overflow-y-auto', pass: menu1.style.overflowY === 'auto' || getComputedStyle(menu1).overflowY === 'auto' });
    menu1.remove();
  } else {
    results.push({ test: 'scroll-max-height-on-16-items', pass: null });
    results.push({ test: 'scroll-overflow-y-auto', pass: null });
  }
  anchor1.remove();

  // Edge 2: Viewport clamp
  const anchorBottom = document.createElement('div');
  anchorBottom.style.cssText = \`position:fixed;top:\${window.innerHeight - 10}px;left:100px;width:80px;height:24px\`;
  document.body.appendChild(anchorBottom);
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchorBottom, [{ label: 'A', action: () => {} }]);
  const menu2 = document.querySelector('.onr-overlay-dropdown');
  if (menu2) {
    const menuRect = menu2.getBoundingClientRect();
    const anchorRect = anchorBottom.getBoundingClientRect();
    results.push({ test: 'viewport-clamp-flips-above-anchor', pass: menuRect.bottom <= anchorRect.top + 2 });
    menu2.remove();
  } else {
    results.push({ test: 'viewport-clamp-flips-above-anchor', pass: null });
  }
  anchorBottom.remove();

  // Edge 3: Disabled item
  let disabledFired = false;
  const anchor3 = document.createElement('div');
  anchor3.style.cssText = 'position:fixed;top:100px;left:200px;width:80px;height:24px';
  document.body.appendChild(anchor3);
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchor3, [
    { label: 'Enabled', action: () => {} },
    { label: 'Disabled', disabled: true, action: () => { disabledFired = true; } },
  ]);
  const menu3 = document.querySelector('.onr-overlay-dropdown');
  const disabledItem = menu3?.querySelectorAll('.onr-dd-item')[1];
  if (disabledItem) {
    results.push({ test: 'disabled-item-cursor-default', pass: disabledItem.style.cursor === 'default' || getComputedStyle(disabledItem).cursor === 'default' });
    disabledItem.click();
    results.push({ test: 'disabled-item-no-action-fired', pass: !disabledFired });
    menu3?.remove();
  } else {
    results.push({ test: 'disabled-item-cursor-default', pass: null });
    results.push({ test: 'disabled-item-no-action-fired', pass: null });
  }
  anchor3.remove();

  return results;
}`;
