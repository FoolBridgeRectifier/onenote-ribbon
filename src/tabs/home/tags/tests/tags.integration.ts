export const tagsIntegrationTest = `() => {
  const results = [];

  // I1: Tags group has all required elements
  const group = document.querySelector('[data-panel="Home"] [data-group="Tags"]');
  results.push({ test: 'tags-group-present', pass: !!group });

  // I2: 3 tag rows
  const rows = group?.querySelectorAll('.onr-tag-row');
  results.push({ test: 'tags-three-rows', pass: (rows?.length ?? 0) === 3 });

  // I3: Dropdown button
  results.push({ test: 'tags-dropdown-btn', pass: !!group?.querySelector('[data-cmd="tags-dropdown"]') });

  // I4: Todo Tag big button
  results.push({ test: 'todo-tag-btn', pass: !!group?.querySelector('[data-cmd="todo-tag"]') });

  // I5: Find Tags big button
  results.push({ test: 'find-tags-btn', pass: !!group?.querySelector('[data-cmd="find-tags"]') });

  // I6: Group name
  const name = group?.querySelector('.onr-group-name');
  results.push({ test: 'tags-group-name', pass: name?.textContent?.trim() === 'Tags' });

  return results;
}`;
