export const imagesIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Images"]');
  results.push({ test: 'images-group-present', pass: !!group });
  results.push({ test: 'images-has-image-btn', pass: !!group?.querySelector('[data-cmd="insert-image"]') });
  results.push({ test: 'images-has-video-btn', pass: !!group?.querySelector('[data-cmd="insert-video"]') });
  results.push({ test: 'images-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Images' });
  results.push({ test: 'images-2-buttons', pass: group?.querySelectorAll('.onr-btn').length === 2 });
  return results;
}`;
