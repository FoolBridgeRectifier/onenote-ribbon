export const emailPageUnitTest = `() => {
  const results = [];
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="email-page"]');
  results.push({ test: 'email-page-exists', pass: !!btn });
  results.push({ test: 'email-page-label', pass: btn?.querySelector('.onr-btn-label')?.textContent?.trim() === 'Email Page' });
  results.push({ test: 'email-page-onr-btn', pass: btn?.classList.contains('onr-btn') ?? false });
  return results;
}`;
