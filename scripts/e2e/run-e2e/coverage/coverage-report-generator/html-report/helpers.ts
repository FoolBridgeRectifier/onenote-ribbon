/**
 * Get CSS class based on coverage percentage.
 */
export function getCoverageClass(coverage: number): string {
  if (coverage >= 80) return 'good';
  if (coverage >= 60) return 'warning';
  return 'danger';
}

/**
 * Escape HTML special characters.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/\u0026/g, '&amp;')
    .replace(/\u003c/g, '&lt;')
    .replace(/\u003e/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
