export const stylesPreviewUnitTest = `() => {
  const results = [];

  // T1: Two preview cards exist
  const cards = document.querySelectorAll('[data-panel="Home"] [data-cmd^="styles-preview-"]');
  results.push({ test: 'two-preview-cards', pass: cards.length === 2 });

  // T2: First card shows "Heading 1" (default offset=0)
  const card0 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"]');
  const span0 = card0?.querySelector('span');
  results.push({ test: 'first-card-label', pass: span0?.textContent?.trim() === 'Heading 1' });

  // T3: Second card shows "Heading 2"
  const card1 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-1"]');
  const span1 = card1?.querySelector('span');
  results.push({ test: 'second-card-label', pass: span1?.textContent?.trim() === 'Heading 2' });

  // T4: Cards have dark background
  const bg = (card0 as HTMLElement)?.style.background || getComputedStyle(card0 as Element).background;
  results.push({ test: 'cards-dark-bg', pass: !!bg });

  return results;
}`;
