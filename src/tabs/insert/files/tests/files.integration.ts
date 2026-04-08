export const filesIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Files"]');
  results.push({ test: 'files-group-present', pass: !!group });
  results.push({ test: 'files-has-attach-file-btn', pass: !!group?.querySelector('[data-cmd="attach-file"]') });
  results.push({ test: 'files-has-embed-note-btn', pass: !!group?.querySelector('[data-cmd="embed-note"]') });
  results.push({ test: 'files-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Files' });
  results.push({ test: 'files-2-buttons', pass: group?.querySelectorAll('.onr-btn').length === 2 });
  return results;
}`;
