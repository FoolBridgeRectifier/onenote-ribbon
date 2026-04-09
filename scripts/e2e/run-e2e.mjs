#!/usr/bin/env node
/**
 * E2E Integration Test Runner for OneNote Ribbon
 *
 * Connects to a running Obsidian instance (port 9222) via Chrome DevTools Protocol.
 * If Obsidian isn't running, launches it via a minimal .e2e-vault/ alongside the plugin.
 *
 * Usage:
 *   node scripts/e2e/run-e2e.mjs [--port 9222] [--suite home,insert] [--keep-vault]
 *
 * Requirements (live mode, recommended):
 *   Start Obsidian with: Obsidian.exe --remote-debugging-port=9222
 *   Then run: npm run test:e2e
 *
 * Launch mode (no running Obsidian):
 *   npm run test:e2e -- --launch
 *   Note: any existing Obsidian window must be closed first (single-instance lock)
 */

import { execFileSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

// ── CLI flags ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const portIdx = args.indexOf("--port");
const CDP_PORT = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : 9222;
const LAUNCH_FRESH = args.includes("--launch");
const KEEP_VAULT = args.includes("--keep-vault");
const suiteIdx = args.indexOf("--suite");
const SUITE_FILTER =
  suiteIdx !== -1
    ? args[suiteIdx + 1].split(",").map((s) => s.trim())
    : null;

// ── Paths ──────────────────────────────────────────────────────────────────────
const OBSIDIAN_EXE = path.join(
  os.homedir(),
  "AppData/Local/Programs/Obsidian/Obsidian.exe"
);
const VAULT_DIR = path.join(ROOT, ".e2e-vault");
const OBSIDIAN_JSON = path.join(
  os.homedir(),
  "AppData/Roaming/obsidian/obsidian.json"
);
const TEMP_NOTE = "_e2e-test-runner.md";

// ── CDP client (native Node 24 WebSocket) ─────────────────────────────────────
class CdpClient {
  #ws;
  #id = 0;
  #pending = new Map();

  constructor(ws) {
    this.#ws = ws;
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== undefined && this.#pending.has(msg.id)) {
        const { resolve, reject } = this.#pending.get(msg.id);
        this.#pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.#id;
      this.#pending.set(id, { resolve, reject });
      this.#ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression, awaitPromise = true) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      const msg =
        result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        JSON.stringify(result.exceptionDetails);
      throw new Error(`CDP eval error: ${msg}`);
    }
    return result.result?.value;
  }

  close() {
    this.#ws.close();
  }
}

// ── CDP utilities ──────────────────────────────────────────────────────────────
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function pollUntil(fn, { timeout = 30000, interval = 500, label = "" } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const v = await fn();
      if (v) return v;
    } catch { /* keep polling */ }
    await sleep(interval);
  }
  throw new Error(`Timeout waiting for: ${label}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function connectCdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.addEventListener("open", () => resolve(new CdpClient(ws)));
    ws.addEventListener("error", (e) =>
      reject(new Error(`WebSocket error: ${e.message || e}`))
    );
    setTimeout(() => reject(new Error("WebSocket connection timed out")), 8000);
  });
}

async function findMainPage(port) {
  const targets = await fetchJson(`http://localhost:${port}/json`);
  // Prefer a page with a real URL (renderer frame, not devtools or about:blank)
  const page =
    targets.find(
      (t) =>
        t.type === "page" &&
        t.webSocketDebuggerUrl &&
        !t.url.startsWith("devtools://")
    ) || targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  if (!page) throw new Error("No page target found in CDP targets");
  return page.webSocketDebuggerUrl;
}

// ── Test vault setup ───────────────────────────────────────────────────────────
function ensureTestVault() {
  fs.mkdirSync(path.join(VAULT_DIR, ".obsidian/plugins/onenote-ribbon"), {
    recursive: true,
  });

  // Minimal vault app config — safeMode:false is required for community plugins in fresh vaults
  writeIfMissing(
    path.join(VAULT_DIR, ".obsidian/app.json"),
    JSON.stringify({ legacyEditor: false, livePreview: true, safeMode: false }, null, 2)
  );

  // Enable the plugin (bypasses community store trust prompt)
  writeJson(path.join(VAULT_DIR, ".obsidian/community-plugins.json"), [
    "onenote-ribbon",
  ]);

  // Disable safe mode so community plugins load
  writeJson(path.join(VAULT_DIR, ".obsidian/core-plugins.json"), {
    "file-explorer": true,
    "global-search": true,
    "markdown-importer": false,
    "word-count": false,
  });

  // Workspace: open test-note.md as active source-mode leaf
  writeJson(path.join(VAULT_DIR, ".obsidian/workspace.json"), {
    main: {
      id: "e2e-main",
      type: "split",
      children: [
        {
          id: "e2e-leaf",
          type: "leaf",
          state: {
            type: "markdown",
            state: { file: TEMP_NOTE, mode: "source", backlinks: false },
          },
        },
      ],
      direction: "vertical",
    },
    left: { id: "e2e-left", type: "split", children: [], direction: "horizontal", width: 170 },
    right: { id: "e2e-right", type: "split", children: [], direction: "horizontal", width: 170 },
    active: "e2e-leaf",
    lastOpenFiles: [TEMP_NOTE],
  });

  // Test note
  writeIfMissing(path.join(VAULT_DIR, TEMP_NOTE), "# E2E Test Note\n\nThis file is used by the automated e2e test runner.\n");

  // Copy built plugin artefacts
  for (const f of ["main.js", "styles.css", "manifest.json"]) {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(VAULT_DIR, ".obsidian/plugins/onenote-ribbon", f));
    }
  }

  console.log(`Test vault ready: ${VAULT_DIR}`);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content);
}

// ── Register test vault in obsidian.json ───────────────────────────────────────
function registerTestVault() {
  const raw = fs.readFileSync(OBSIDIAN_JSON, "utf8");
  const config = JSON.parse(raw);
  const backup = raw;

  // Set all existing vaults to not-open
  for (const k of Object.keys(config.vaults)) delete config.vaults[k].open;

  const vaultWindowsPath = VAULT_DIR.replace(/\//g, "\\");
  config.vaults["e2e-test-vault"] = {
    path: vaultWindowsPath,
    ts: Date.now(),
    open: true,
  };

  fs.writeFileSync(OBSIDIAN_JSON, JSON.stringify(config, null, 2));
  return backup; // caller must restore on exit
}

function restoreObsidianConfig(backup) {
  fs.writeFileSync(OBSIDIAN_JSON, backup);
}

// ── Integration test loading ───────────────────────────────────────────────────
/**
 * Extract the template-literal body from a .ts file of the form:
 *   export const xyzTest = `() => { ... }`;
 *
 * Returns the function source ready to call: (async <body>)()
 */
function loadTestString(tsFilePath) {
  const content = fs.readFileSync(tsFilePath, "utf8");
  const start = content.indexOf("`");
  const end = content.lastIndexOf("`");
  if (start === -1 || end === -1 || start === end) {
    throw new Error(`No template literal found in ${tsFilePath}`);
  }
  // Raw extraction: the outer template literal might contain \` and \$ escapes.
  // These were added in the .ts source to prevent outer-template interpolation.
  // When we eval the extracted body as JS, we must unescape them back to ` and $.
  const raw = content.slice(start + 1, end).trim();
  const fnBody = raw
    .replace(/\\`/g, "`")   // \` → ` (inner template literal delimiters)
    .replace(/\\\$/g, "$"); // \$ → $ (inner template literal interpolations)
  // Wrap as async so the function body can use await
  return `(async ${fnBody})()`;
}

// All integration test suites
const SUITES = [
  { name: "home", file: "src/tabs/home/tests/home.integration.ts" },
  { name: "home-combinations", file: "src/tabs/home/tests/home.combinations.ts" },
  { name: "insert", file: "src/tabs/insert/tests/insert.integration.ts" },
  { name: "insert-combinations", file: "src/tabs/insert/tests/insert.combinations.ts" },
  { name: "basic-text", file: "src/tabs/home/basic-text/tests/basic-text.integration.ts" },
  { name: "clipboard", file: "src/tabs/home/clipboard/tests/clipboard.integration.ts" },
  { name: "styles", file: "src/tabs/home/styles/tests/styles.integration.ts" },
  { name: "tags", file: "src/tabs/home/tags/tests/tags.integration.ts" },
  { name: "email", file: "src/tabs/home/email/tests/email.integration.ts" },
  { name: "navigate", file: "src/tabs/home/navigate/tests/navigate.integration.ts" },
  { name: "tables", file: "src/tabs/insert/tables/tests/tables.integration.ts" },
  { name: "files", file: "src/tabs/insert/files/tests/files.integration.ts" },
  { name: "images", file: "src/tabs/insert/images/tests/images.integration.ts" },
  { name: "links", file: "src/tabs/insert/links/tests/links.integration.ts" },
  { name: "timestamp", file: "src/tabs/insert/timestamp/tests/timestamp.integration.ts" },
  { name: "blocks", file: "src/tabs/insert/blocks/tests/blocks.integration.ts" },
  { name: "symbols", file: "src/tabs/insert/symbols/tests/symbols.integration.ts" },
];

// ── Result printing ────────────────────────────────────────────────────────────
function printSuiteResults(suiteName, results) {
  const pad = (s, n) => s.padEnd(n);
  let passed = 0;
  let failed = 0;

  console.log(`\n  Suite: ${suiteName}`);
  console.log("  " + "─".repeat(60));

  if (!Array.isArray(results)) {
    console.log(`  ERROR: unexpected result type: ${JSON.stringify(results)}`);
    return { passed: 0, failed: 1 };
  }

  for (const r of results) {
    const icon = r.pass ? "✓" : "✗";
    const label = r.pass ? "" : " ← FAIL";
    console.log(`  ${icon} ${pad(r.test, 50)}${label}`);
    if (r.pass) passed++;
    else failed++;
  }

  return { passed, failed };
}

// ── Ensure test note is open ───────────────────────────────────────────────────
async function ensureEditorOpen(cdp) {
  // In live mode: create the temp note in the current vault, open it
  try {
    // Check if there's already an active editor
    const hasEditor = await cdp.eval("!!app.workspace.activeEditor?.editor", false);
    if (hasEditor) return;
  } catch { /* ignore */ }

  // Create temp note and open it
  await cdp.eval(`
    (async () => {
      const content = '# E2E Test\\n\\nTemporary file used by run-e2e.mjs — safe to delete.\\n';
      try { await app.vault.create('${TEMP_NOTE}', content); } catch {}
      await app.workspace.openLinkText('${TEMP_NOTE}', '', true);
    })()
  `);

  await pollUntil(
    () => cdp.eval("!!app.workspace.activeEditor?.editor", false),
    { timeout: 15000, label: "active editor" }
  );
}

async function cleanupTempNote(cdp) {
  try {
    await cdp.eval(`
      (async () => {
        const f = app.vault.getAbstractFileByPath('${TEMP_NOTE}');
        if (f) await app.vault.delete(f);
      })()
    `);
  } catch { /* best effort */ }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("OneNote Ribbon — E2E Integration Test Runner");
  console.log("═".repeat(55));

  // 1. Build plugin
  console.log("\n[1/4] Building plugin...");
  execFileSync("node", ["esbuild.config.mjs"], { cwd: ROOT, stdio: "inherit" });

  // 2. Choose connection strategy
  let obsidianProcess = null;
  let obsidianConfigBackup = null;
  let liveMode = false; // connected to user's running Obsidian
  let cdp;

  if (!LAUNCH_FRESH) {
    // Try connecting to running Obsidian at CDP_PORT
    console.log(`\n[2/4] Checking for running Obsidian on port ${CDP_PORT}...`);
    try {
      const wsUrl = await findMainPage(CDP_PORT);
      cdp = await connectCdp(wsUrl);
      liveMode = true;
      console.log(`      Connected to live Obsidian.`);
    } catch {
      console.log(
        `      Not found. Use --launch to start a fresh instance, or start Obsidian with:\n` +
        `      Obsidian.exe --remote-debugging-port=${CDP_PORT}`
      );
      process.exit(1);
    }
  } else {
    // Launch fresh Obsidian with test vault
    console.log("\n[2/4] Setting up test vault and launching Obsidian...");

    // Kill any running Obsidian (single-instance lock prevents a second one from opening)
    try {
      execFileSync("taskkill", ["/IM", "Obsidian.exe", "/F"], { stdio: "ignore" });
      console.log("      Killed existing Obsidian process.");
      await sleep(1500); // wait for process to fully exit
    } catch { /* not running — fine */ }

    ensureTestVault();
    obsidianConfigBackup = registerTestVault();

    if (!fs.existsSync(OBSIDIAN_EXE)) {
      console.error(`Obsidian not found at: ${OBSIDIAN_EXE}`);
      restoreObsidianConfig(obsidianConfigBackup);
      process.exit(1);
    }

    obsidianProcess = spawn(OBSIDIAN_EXE, [`--remote-debugging-port=${CDP_PORT}`], {
      detached: false,
      stdio: "ignore",
    });

    // Wait for CDP to become available (Obsidian takes ~10-20s to start)
    const targets = await pollUntil(
      async () => {
        try { return await fetchJson(`http://localhost:${CDP_PORT}/json`); }
        catch { return null; }
      },
      { timeout: 60000, interval: 1000, label: `CDP on port ${CDP_PORT}` }
    );
    console.log(`      Obsidian launched (${targets.length} CDP targets found).`);

    const wsUrl = await findMainPage(CDP_PORT);
    cdp = await connectCdp(wsUrl);
  }

  try {
    // 3. Wait for Obsidian workspace + plugin to load
    console.log("\n[3/4] Waiting for Obsidian workspace and plugin to load...");
    await pollUntil(
      () => cdp.eval("!!app?.workspace", false),
      { timeout: 30000, label: "app.workspace" }
    );
    // Wait for the plugin ribbon to appear in the DOM
    await pollUntil(
      () => cdp.eval("!!document.querySelector('[data-panel]')", false),
      { timeout: 20000, label: "ribbon DOM ([data-panel])" }
    );
    console.log("      Obsidian loaded, ribbon detected.");

    // Dismiss any modal dialogs (e.g. plugin trust prompt in launch mode)
    await cdp.eval(`
      document.querySelectorAll('.modal-button-container button').forEach(btn => {
        if (btn.classList.contains('mod-cta') || btn.textContent?.includes('Trust')) btn.click();
      });
    `, false).catch(() => { });
    await sleep(500);

    // Ensure an editor leaf is open for functional tests
    await ensureEditorOpen(cdp);
    console.log("      Active editor ready.");

    // 4. Run suites
    const suites = SUITE_FILTER
      ? SUITES.filter((s) => SUITE_FILTER.includes(s.name))
      : SUITES;

    console.log(`\n[4/4] Running ${suites.length} suite(s)...`);

    let totalPassed = 0;
    let totalFailed = 0;
    const failedSuites = [];

    for (const suite of suites) {
      const tsPath = path.join(ROOT, suite.file);
      if (!fs.existsSync(tsPath)) {
        console.log(`  SKIP ${suite.name}: file not found (${suite.file})`);
        continue;
      }

      let results;
      try {
        const expression = loadTestString(tsPath);
        results = await cdp.eval(expression);
      } catch (err) {
        console.log(`\n  Suite: ${suite.name}`);
        console.log(`  ERROR: ${err.message}`);
        totalFailed++;
        failedSuites.push(suite.name);
        continue;
      }

      const { passed, failed } = printSuiteResults(suite.name, results);
      totalPassed += passed;
      totalFailed += failed;
      if (failed > 0) failedSuites.push(suite.name);
    }

    // Summary
    console.log("\n" + "═".repeat(55));
    console.log(
      `  Results: ${totalPassed} passed, ${totalFailed} failed  ` +
      `(${suites.length} suite(s))`
    );
    if (failedSuites.length > 0) {
      console.log(`  Failed suites: ${failedSuites.join(", ")}`);
    }
    console.log("═".repeat(55));

    // Clean up temp note in live mode
    if (liveMode) await cleanupTempNote(cdp);

    cdp.close();
    process.exitCode = totalFailed > 0 ? 1 : 0;
  } finally {
    if (obsidianProcess) {
      obsidianProcess.kill();
      console.log("Obsidian process terminated.");
    }
    if (obsidianConfigBackup) {
      restoreObsidianConfig(obsidianConfigBackup);
      console.log("obsidian.json restored.");
    }
    if (!KEEP_VAULT && obsidianProcess && fs.existsSync(VAULT_DIR)) {
      fs.rmSync(VAULT_DIR, { recursive: true, force: true });
      console.log("Test vault cleaned up.");
    }
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
