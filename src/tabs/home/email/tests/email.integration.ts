export const emailIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Home"] [data-group="Email & Meetings"]');
  results.push({ test: 'email-group-present', pass: !!group });
  results.push({ test: 'email-page-btn', pass: !!group?.querySelector('[data-cmd="email-page"]') });
  results.push({ test: 'meeting-details-btn', pass: !!group?.querySelector('[data-cmd="meeting-details"]') });
  results.push({ test: 'email-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Email & Meetings' });
  return results;
}`;
