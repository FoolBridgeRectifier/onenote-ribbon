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
export const OBSIDIAN_EXE_RELATIVE_PATH = 'AppData/Local/Programs/Obsidian/Obsidian.exe';

/** Relative path from os.homedir() to the Obsidian registry JSON. */
export const OBSIDIAN_CONFIG_RELATIVE_PATH = 'AppData/Roaming/obsidian/obsidian.json';

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
  // Deep coverage suites
  {
    name: 'tag-manipulation-deep',
    file: 'src/e2e/home-tab/tag-manipulation-deep/tagManipulationDeepTest.ts',
  },
  {
    name: 'styles-deep',
    file: 'src/e2e/home-tab/styles-deep/stylesDeepTest.ts',
  },
  {
    name: 'formatting-deep',
    file: 'src/e2e/home-tab/formatting-deep/formattingDeepTest.ts',
  },
  {
    name: 'tags-removal',
    file: 'src/e2e/home-tab/tags-removal/tagsRemovalTest.ts',
  },
  {
    name: 'editor-integration-deep',
    file: 'src/e2e/home-tab/editor-integration-deep/editorIntegrationDeepTest.ts',
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
  {
    name: 'list-deep',
    file: 'src/e2e/home-tab/list-deep/listDeepTest.ts',
  },
  {
    name: 'color-picker-deep',
    file: 'src/e2e/home-tab/color-picker-deep/colorPickerDeepTest.ts',
  },
  {
    name: 'multiline-formatting-deep',
    file: 'src/e2e/home-tab/multiline-formatting-deep/multilineFormattingDeepTest.ts',
  },
  {
    name: 'tag-apply-deep',
    file: 'src/e2e/home-tab/tag-apply-deep/tagApplyDeepTest.ts',
  },
  {
    name: 'tag-dropdown-deep',
    file: 'src/e2e/home-tab/tag-dropdown-deep/tagDropdownDeepTest.ts',
  },
  {
    name: 'format-painter-apply',
    file: 'src/e2e/home-tab/format-painter-apply/formatPainterApplyTest.ts',
  },
  {
    name: 'highlight-color-deep',
    file: 'src/e2e/home-tab/highlight-color-deep/highlightColorDeepTest.ts',
  },
  {
    name: 'per-line-deep',
    file: 'src/e2e/home-tab/per-line-deep/perLineDeepTest.ts',
  },
  {
    name: 'domain-conversion-deep',
    file: 'src/e2e/home-tab/domain-conversion-deep/domainConversionDeepTest.ts',
  },
  {
    name: 'clear-formatting-deep',
    file: 'src/e2e/home-tab/clear-formatting-deep/clearFormattingDeepTest.ts',
  },
  {
    name: 'inline-todo-deep',
    file: 'src/e2e/home-tab/inline-todo-deep/inlineTodoDeepTest.ts',
  },
  {
    name: 'tag-apply-more',
    file: 'src/e2e/home-tab/tag-apply-more/tagApplyMoreTest.ts',
  },
  {
    name: 'tag-toggle-deep',
    file: 'src/e2e/home-tab/tag-toggle-deep/tagToggleDeepTest.ts',
  },
  {
    name: 'per-line-html-deep',
    file: 'src/e2e/home-tab/per-line-html-deep/perLineHtmlDeepTest.ts',
  },
  {
    name: 'highlight-helpers-branch',
    file: 'src/e2e/home-tab/highlight-helpers-branch/highlightHelpersBranchTest.ts',
  },
  {
    name: 'span-state-branch',
    file: 'src/e2e/home-tab/span-state-branch/spanStateBranchTest.ts',
  },
  {
    name: 'callout-sequence-deep',
    file: 'src/e2e/home-tab/callout-sequence-deep/calloutSequenceDeepTest.ts',
  },
];

// Total E2E rule count: 166 (home) + 10 (edge-cases) + 10 (ribbon) + 20 (shared) = 206
// Note: Insert tab rules (167-250) are not yet implemented
