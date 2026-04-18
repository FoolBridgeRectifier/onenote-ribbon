import type { SuiteDefinition } from './interfaces';

export const DEFAULT_CDP_PORT = 9222;

export const TEMP_NOTE_FILENAME = '_e2e-test-runner.md';

export const CLI_FLAG_PORT = '--port';
export const CLI_FLAG_LAUNCH = '--launch';
export const CLI_FLAG_KEEP_VAULT = '--keep-vault';
export const CLI_FLAG_SUITE = '--suite';
export const CLI_FLAG_COVERAGE = '--coverage';
export const CLI_FLAG_COVERAGE_SCOPE = '--coverage-scope';
export const CLI_FLAG_COVERAGE_THRESHOLD = '--coverage-threshold';

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
  // Insert tab suites
  {
    name: 'insert',
    file: 'src/e2e/insert-tab/insert/insertIntegrationTest.ts',
  },
  {
    name: 'insert-combinations',
    file: 'src/e2e/insert-tab/insert-combinations/insertIntegrationCombinationsTest.ts',
  },
  {
    name: 'tables',
    file: 'src/e2e/insert-tab/tables/tablesIntegrationTest.ts',
  },
  { name: 'files', file: 'src/e2e/insert-tab/files/filesIntegrationTest.ts' },
  {
    name: 'images',
    file: 'src/e2e/insert-tab/images/imagesIntegrationTest.ts',
  },
  { name: 'links', file: 'src/e2e/insert-tab/links/linksIntegrationTest.ts' },
  {
    name: 'timestamp',
    file: 'src/e2e/insert-tab/timestamp/timestampIntegrationTest.ts',
  },
  {
    name: 'blocks',
    file: 'src/e2e/insert-tab/blocks/blocksIntegrationTest.ts',
  },
  {
    name: 'symbols',
    file: 'src/e2e/insert-tab/symbols/symbolsIntegrationTest.ts',
  },
];
