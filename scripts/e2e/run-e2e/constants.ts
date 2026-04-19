export const RUNNER_SEPARATOR = '═'.repeat(55);
export const SUITE_SEPARATOR = '─'.repeat(60);

export const DEFAULT_POLL_TIMEOUT_MS = 30000;
export const DEFAULT_POLL_INTERVAL_MS = 500;
export const WEBSOCKET_TIMEOUT_MS = 8000;
export const CDP_REQUEST_TIMEOUT_MS = 30000;
export const CDP_LAUNCH_TIMEOUT_MS = 60000;
export const EDITOR_READY_TIMEOUT_MS = 15000;
export const RIBBON_READY_TIMEOUT_MS = 20000;
export const WORKSPACE_READY_TIMEOUT_MS = 30000;
export const POST_MODAL_WAIT_MS = 500;
export const POST_KILL_WAIT_MS = 1500;

export const TEST_VAULT_KEY = 'e2e-test-vault';
export const TEST_PLUGIN_DIRECTORY = '.obsidian/plugins/onenote-ribbon';
export const TEST_NOTE_CONTENT =
  '# E2E Test Note\n\nThis file is used by the automated e2e test runner.\n';
export const TEMP_NOTE_EDITOR_CONTENT =
  '# E2E Test\n\nTemporary file used by run-e2e.ts - safe to delete.\n';

export const RIBBON_PANEL_SELECTOR = '[data-panel]';
export const TRUST_MODAL_BUTTON_LABELS = [
  'Trust author and enable plugins',
  'Trust author',
  'Enable plugins',
] as const;

export const BUILD_ARTIFACT_FILE_NAMES = [
  'main.js',
  'styles.css',
  'manifest.json',
] as const;
