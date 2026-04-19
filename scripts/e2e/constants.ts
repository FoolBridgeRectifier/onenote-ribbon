import type { SuiteDefinition } from './interfaces';

export const DEFAULT_CDP_PORT = 9222;

export const TEMP_NOTE_FILENAME = '_e2e-test-runner.md';

export const CLI_FLAG_PORT = '--port';
export const CLI_FLAG_LAUNCH = '--launch';
export const CLI_FLAG_KEEP_VAULT = '--keep-vault';
export const CLI_FLAG_SUITE = '--suite';
export const CLI_FLAG_COVERAGE_THRESHOLD = '--coverage-threshold';
export const CLI_FLAG_CODE_COVERAGE = '--code-coverage';
export const CLI_FLAG_COVERAGE_REPORT = '--coverage-report';
export const CLI_FLAG_COVERAGE_HTML = '--coverage-html';

/** Relative path from os.homedir() to the Obsidian executable. */
export const OBSIDIAN_EXE_RELATIVE_PATH =
  'AppData/Local/Programs/Obsidian/Obsidian.exe';

/** Relative path from os.homedir() to the Obsidian registry JSON. */
export const OBSIDIAN_CONFIG_RELATIVE_PATH =
  'AppData/Roaming/obsidian/obsidian.json';

export const E2E_VAULT_DIRNAME = '.e2e-vault';

export const SUITES: SuiteDefinition[] = [
  // Home tab suites
  { name: 'home', file: 'src/e2e/home-tab/home/homeIntegrationTest.ts' },
  {
    name: 'home-combinations',
    file: 'src/e2e/home-tab/home-combinations/homeIntegrationCombinationsTest.ts',
  },
  {
    name: 'basic-text',
    file: 'src/e2e/home-tab/basic-text/basicTextIntegrationTest.ts',
  },
  {
    name: 'clipboard',
    file: 'src/e2e/home-tab/clipboard/clipboardIntegrationTest.ts',
  },
  { name: 'styles', file: 'src/e2e/home-tab/styles/stylesIntegrationTest.ts' },
  { name: 'tags', file: 'src/e2e/home-tab/tags/tagsIntegrationTest.ts' },
  { name: 'email', file: 'src/e2e/home-tab/email/emailIntegrationTest.ts' },
  {
    name: 'navigate',
    file: 'src/e2e/home-tab/navigate/navigateIntegrationTest.ts',
  },
  // Edge cases suite
  {
    name: 'edge-cases',
    file: 'src/e2e/edge-cases/edgeCasesIntegrationTest.ts',
  },
  // Ribbon components suite
  {
    name: 'ribbon-components',
    file: 'src/e2e/ribbon/ribbonComponentsIntegrationTest.ts',
  },
  // Shared modules suites
  {
    name: 'shared-hooks',
    file: 'src/e2e/shared/hooks/hooksE2ETest.ts',
  },
  {
    name: 'shared-context',
    file: 'src/e2e/shared/context/contextE2ETest.ts',
  },
];

// Total E2E rule count: 166 (home) + 10 (edge-cases) + 10 (ribbon) + 20 (shared) = 206
// Note: Insert tab rules (167-250) are not yet implemented
