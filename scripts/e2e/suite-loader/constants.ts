/** Lines injected before the bundled suite source to set up the CJS module shim. */
export const MODULE_PREAMBLE_LINES = [
  '(() => {',
  '  const module = { exports: {} };',
  '  const exports = module.exports;',
];

/** Lines injected after the bundled suite source to locate and invoke the exported test function. */
export const MODULE_POSTAMBLE_LINES = [
  '  const suiteModule = module.exports;',
  '  const exportEntries = Object.entries(suiteModule);',
  "  const integrationExportEntry = exportEntries.find(([exportName, exportValue]) => exportName.toLowerCase().includes('integrationtest') && typeof exportValue === 'function');",
  "  const selectedExport = integrationExportEntry ? integrationExportEntry[1] : (exportEntries.find(([, exportValue]) => typeof exportValue === 'function') || [null, null])[1];",
  "  if (typeof selectedExport === 'function') {",
  '    return selectedExport();',
  '  }',
  "  throw new Error('No function suite export found in bundled module');",
  '})()',
];
