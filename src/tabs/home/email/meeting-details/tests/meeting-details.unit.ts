export const meetingDetailsUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="meeting-details"]');
  results.push({ test: 'meeting-details-exists', pass: !!btn });
  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'meeting-has-date', pass: val.includes('date:') });
    results.push({ test: 'meeting-has-attendees', pass: val.includes('attendees:') });
    results.push({ test: 'meeting-has-topics', pass: val.includes('topics:') });
    results.push({ test: 'meeting-has-action-items', pass: val.includes('action-items:') });
    results.push({ test: 'meeting-has-heading', pass: val.includes('## Meeting Notes') });
    editor.setValue('');
  }
  return results;
}`;
