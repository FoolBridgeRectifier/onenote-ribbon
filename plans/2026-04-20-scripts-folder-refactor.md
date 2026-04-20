# scripts/ Folder Convention Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all convention violations in the `scripts/` folder — eliminate `tests/` subfolders by colocating tests, reduce each folder to exactly one primary implementation file, and split all files exceeding 150 lines.

**Architecture:** Three phases: (1) relocate misplaced tests and delete empty `tests/` folders; (2) reorganize `coverage/` to have one primary file with secondary files in subfolders; (3) split each file that exceeds 150 lines by extracting interfaces, constants, helpers, and sub-feature modules.

**Tech Stack:** TypeScript, Node.js, CommonJS (`.cjs` for hooks and jest), ES Modules (`.mjs` for esbuild config), Jest for tests.

---

## File Structure After Refactor

```
scripts/
├── run-debug.mjs                                          (unchanged)
├── e2e/
│   ├── constants.ts                                       (unchanged)
│   ├── interfaces.ts                                      (unchanged)
│   ├── run-e2e.ts                                         (unchanged)
│   ├── run-e2e/
│   │   ├── constants.ts                                   (unchanged)
│   │   ├── interfaces.ts                                  (unchanged)
│   │   ├── runE2e.ts                                      (SPLIT — ≤150 lines)
│   │   ├── helpers.ts                                     (NEW — extracted from runE2e.ts)
│   │   ├── cdpClient/
│   │   │   ├── cdpClient.ts                               (unchanged)
│   │   │   └── cdpClient.test.ts                          (unchanged — already colocated)
│   │   ├── connectionStrategy/
│   │   │   ├── connectionStrategy.ts                      (unchanged)
│   │   │   └── connectionStrategy.test.ts                 (unchanged — already colocated)
│   │   ├── coverage/
│   │   │   ├── cdpCoverage.ts                             (SPLIT — ≤150 lines)
│   │   │   ├── constants.ts                               (unchanged)
│   │   │   ├── interfaces.ts                              (FILLED — interfaces moved from cdpCoverage.ts)
│   │   │   ├── helpers.ts                                 (NEW — utility fns + formatCoveragePercent)
│   │   │   ├── coverage-calculator/
│   │   │   │   ├── coverageCalculator.ts                  (NEW — calculateCoverageSummary, calculateMappedSummary)
│   │   │   │   ├── constants.ts                           (NEW — empty/minimal)
│   │   │   │   └── interfaces.ts                          (NEW — empty/minimal)
│   │   │   ├── coverage-mapper/
│   │   │   │   ├── coverageMapper.ts                      (NEW — mapCoverageToSource, mapBundleCoverage)
│   │   │   │   ├── constants.ts                           (NEW — empty/minimal)
│   │   │   │   └── interfaces.ts                          (NEW — empty/minimal)
│   │   │   ├── coverage-report-generator/
│   │   │   │   ├── coverageReportGenerator.ts             (MOVED+SPLIT — generateDetailedReport, convertMappedToFileCoverage, saveReportJson)
│   │   │   │   ├── interfaces.ts                          (NEW — FileCoverage, DetailedCoverageReport)
│   │   │   │   ├── helpers.ts                             (NEW — analyzeFileCoverage, isExecutableLine, inferBranchType, extractFilePath, getLineFromOffset, calculateSummaryFromFiles, isPluginScript)
│   │   │   │   └── html-report/
│   │   │   │       ├── htmlReport.ts                      (NEW — generateHtmlReport, saveHtmlReport, generateUncoveredBranchesReport)
│   │   │   │       └── helpers.ts                         (NEW — getCoverageClass, escapeHtml)
│   │   │   ├── read-jest-coverage-threshold/
│   │   │   │   ├── readJestCoverageThreshold.ts           (MOVED from coverage root)
│   │   │   │   ├── readJestCoverageThreshold.test.ts      (MOVED from coverage/tests/)
│   │   │   │   └── constants.ts                           (NEW — COVERAGE_LINES_PATTERN)
│   │   │   └── source-map-resolver/
│   │   │       ├── sourceMapResolver.ts                   (MOVED+SPLIT — extractInlineSourceMap, findOriginalPosition, getOriginalSourceFiles, getSourceMapForBundle, clearSourceMapCache, normalizeSourcePath, parseSourceMap)
│   │   │       ├── sourceMapResolver.test.ts              (MOVED from coverage root)
│   │   │       ├── interfaces.ts                          (NEW — ParsedSourceMap, SourceMapping)
│   │   │       ├── constants.ts                           (NEW — VLQ constants)
│   │   │       └── helpers.ts                             (NEW — decodeVLQ)
│   │   ├── obsidianVault/
│   │   │   └── obsidianVault.ts                           (unchanged — tests/ folder deleted, was empty)
│   │   ├── parseCliArguments/
│   │   │   ├── parseCliArguments.ts                       (unchanged)
│   │   │   └── parseCliArguments.test.ts                  (MOVED from tests/)
│   │   ├── polling/
│   │   │   ├── polling.ts                                 (unchanged)
│   │   │   └── polling.test.ts                            (MOVED from tests/)
│   │   ├── suiteExecution/
│   │   │   └── suiteExecution.ts                          (unchanged — tests/ folder deleted, was empty)
│   │   ├── suiteResults/
│   │   │   ├── suiteResults.ts                            (unchanged)
│   │   │   └── suiteResults.test.ts                       (MOVED from tests/)
│   │   └── workspaceSetup/
│   │       ├── workspaceSetup.ts                          (TRIMMED — ≤150 lines)
│   │       ├── helpers.ts                                 (NEW — evaluateWithTimeout)
│   │       └── workspaceSetup.test.ts                     (MOVED from tests/)
│   └── suite-loader/
│       ├── buildSuiteExpression.ts                        (unchanged)
│       ├── buildSuiteExpression.test.ts                   (unchanged — already colocated)
│       ├── constants.ts                                   (unchanged)
│       ├── interfaces.ts                                  (unchanged)
│       └── fixtures/                                      (unchanged)
├── esbuild/
│   ├── coverage-instrument-plugin/
│   │   ├── coverageInstrumentPlugin.ts                    (MOVED+SPLIT — plugin factory + on-load handler)
│   │   ├── interfaces.ts                                  (NEW — all interfaces from coverageInstrumentPlugin.ts)
│   │   ├── constants.ts                                   (NEW — COVERAGE_GLOBAL + counters)
│   │   └── helpers.ts                                     (NEW — instrumentation helpers)
│   └── coverageInstrumentPlugin.ts                        (BECOMES re-export shim OR deleted if no external imports)
├── hooks/
│   ├── sessionStartProjectGuide.cjs                       (unchanged)
│   ├── stopObsidianMcpCheck.cjs                           (unchanged)
│   └── session-start/
│       ├── discoverContext.cjs                            (SPLIT — ≤150 lines)
│       ├── discoverContext.test.cjs                       (MOVED from tests/)
│       └── helpers.cjs                                    (NEW — extracted from discoverContext.cjs)
└── jest/
    └── cssTransform.cjs                                   (unchanged)
```

---

## Task 1: Relocate tests — move 5 test files out of `tests/` subfolders

**Files:**
- Move: `scripts/e2e/run-e2e/parseCliArguments/tests/parseCliArguments.test.ts` → `scripts/e2e/run-e2e/parseCliArguments/parseCliArguments.test.ts`
- Move: `scripts/e2e/run-e2e/polling/tests/polling.test.ts` → `scripts/e2e/run-e2e/polling/polling.test.ts`
- Move: `scripts/e2e/run-e2e/suiteResults/tests/suiteResults.test.ts` → `scripts/e2e/run-e2e/suiteResults/suiteResults.test.ts`
- Move: `scripts/e2e/run-e2e/workspaceSetup/tests/workspaceSetup.test.ts` → `scripts/e2e/run-e2e/workspaceSetup/workspaceSetup.test.ts`
- Move: `scripts/hooks/session-start/tests/discoverContext.test.cjs` → `scripts/hooks/session-start/discoverContext.test.cjs`

- [ ] **Step 1: Move parseCliArguments test and fix import**

Move the file. Then update the import:
```ts
// parseCliArguments/parseCliArguments.test.ts — change:
import { parseCliArguments } from '../parseCliArguments';
// to:
import { parseCliArguments } from './parseCliArguments';
```

- [ ] **Step 2: Move polling test and fix import**

Move the file. Then update the import:
```ts
// polling/polling.test.ts — change:
import { pollUntil, sleep } from '../polling';
// to:
import { pollUntil, sleep } from './polling';
```

- [ ] **Step 3: Move suiteResults test and fix import**

Move the file. Then update the import:
```ts
// suiteResults/suiteResults.test.ts — change:
import { printSuiteResults } from '../suiteResults';
// to:
import { printSuiteResults } from './suiteResults';
```

- [ ] **Step 4: Move workspaceSetup test and fix imports**

Move the file. Then update all imports (4 changes):
```ts
// workspaceSetup/workspaceSetup.test.ts — change:
import { RIBBON_READY_TIMEOUT_MS, WORKSPACE_READY_TIMEOUT_MS } from '../../constants';
// to:
import { RIBBON_READY_TIMEOUT_MS, WORKSPACE_READY_TIMEOUT_MS } from '../constants';

import { pollUntil, sleep } from '../../polling/polling';
// to:
import { pollUntil, sleep } from '../polling/polling';

import { dismissTrustModal, waitForWorkspaceAndRibbon } from '../workspaceSetup';
// to:
import { dismissTrustModal, waitForWorkspaceAndRibbon } from './workspaceSetup';

import type { CdpClient } from '../../cdpClient/cdpClient';
// to:
import type { CdpClient } from '../cdpClient/cdpClient';
```

- [ ] **Step 5: Move discoverContext test and fix import**

Move the file. Then update the require:
```js
// session-start/discoverContext.test.cjs — change:
} = require('../discoverContext.cjs');
// to:
} = require('./discoverContext.cjs');
```

- [ ] **Step 6: Run tests to confirm all pass**

```bash
npm test
```
Expected: All tests pass, 0 failures.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(scripts): colocate tests — remove tests/ subfolders"
```

---

## Task 2: Delete 3 empty `tests/` folders

**Files:**
- Delete: `scripts/e2e/run-e2e/obsidianVault/tests/` (empty)
- Delete: `scripts/e2e/run-e2e/suiteExecution/tests/` (empty)
- Delete: `scripts/esbuild/coverage-instrument-plugin/tests/` (empty)

- [ ] **Step 1: Delete all three empty folders**

```bash
Remove-Item -Recurse -Force "scripts\e2e\run-e2e\obsidianVault\tests"
Remove-Item -Recurse -Force "scripts\e2e\run-e2e\suiteExecution\tests"
Remove-Item -Recurse -Force "scripts\esbuild\coverage-instrument-plugin\tests"
```

- [ ] **Step 2: Run tests to confirm no regressions**

```bash
npm test
```
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(scripts): delete empty tests/ folders"
```

---

## Task 3: Reorganize `coverage/` — move 4 secondary files into subfolders

The `coverage/` folder has 5 implementation files. Only `cdpCoverage.ts` should be the primary. The others must move into their own kebab-case subfolders.

**Files:**
- Create: `coverage/read-jest-coverage-threshold/` subfolder
- Create: `coverage/source-map-resolver/` subfolder
- Create: `coverage/coverage-report-generator/` subfolder
- Create: `coverage/helpers.ts` (merge from `coverageReport.ts`)

- [ ] **Step 1: Create `read-jest-coverage-threshold/` subfolder and move `readJestCoverageThreshold.ts`**

Extract `COVERAGE_LINES_PATTERN` constant out of the function body into a new `constants.ts`:

Create `scripts/e2e/run-e2e/coverage/read-jest-coverage-threshold/constants.ts`:
```ts
export const COVERAGE_LINES_PATTERN =
  /coverageThreshold\s*:\s*\{[\s\S]*?global\s*:\s*\{[\s\S]*?lines\s*:\s*(\d+(?:\.\d+)?)/m;
```

Create `scripts/e2e/run-e2e/coverage/read-jest-coverage-threshold/readJestCoverageThreshold.ts`:
```ts
import * as fs from 'fs';
import * as path from 'path';

import { COVERAGE_LINES_PATTERN } from './constants';

export function readJestCoverageLineThreshold(rootPath: string): number | null {
  const jestConfigFilePath = path.join(rootPath, 'jest.config.js');

  if (!fs.existsSync(jestConfigFilePath)) {
    return null;
  }

  try {
    const jestConfigContent = fs.readFileSync(jestConfigFilePath, 'utf8');
    const thresholdMatch = jestConfigContent.match(COVERAGE_LINES_PATTERN);

    if (!thresholdMatch) {
      return null;
    }

    const parsedThreshold = Number.parseFloat(thresholdMatch[1]);

    return Number.isNaN(parsedThreshold) ? null : parsedThreshold;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Move `coverage/tests/readJestCoverageThreshold.test.ts` into the new subfolder**

Move file to `coverage/read-jest-coverage-threshold/readJestCoverageThreshold.test.ts`. Update import:
```ts
// change:
import { readJestCoverageLineThreshold } from '../readJestCoverageThreshold';
// to:
import { readJestCoverageLineThreshold } from './readJestCoverageThreshold';
```
Delete the now-empty `coverage/tests/` folder.
Delete the original `coverage/readJestCoverageThreshold.ts` file.

- [ ] **Step 3: Create `source-map-resolver/` subfolder and move `sourceMapResolver.ts`**

Create directory `coverage/source-map-resolver/`. Copy `sourceMapResolver.ts` into it (no import changes needed — it only imports from `fs` and `path`). Move `coverage/sourceMapResolver.test.ts` into the same subfolder — no import changes needed (test imports `from './sourceMapResolver'` which still works).

Delete the original `coverage/sourceMapResolver.ts` and `coverage/sourceMapResolver.test.ts`.

- [ ] **Step 4: Create `coverage-report-generator/` subfolder and move `coverageReportGenerator.ts`**

Create directory `coverage/coverage-report-generator/`. Move `coverageReportGenerator.ts` into it. Update its imports to point one level up:
```ts
// change:
import type { CoverageData, CoverageSummary, SourceMappedCoverage } from './cdpCoverage';
import { mapCoverageToSource } from './cdpCoverage';
// to:
import type { CoverageData, CoverageSummary, SourceMappedCoverage } from '../cdpCoverage';
import { mapCoverageToSource } from '../cdpCoverage';
```
Delete the original `coverage/coverageReportGenerator.ts`.

- [ ] **Step 5: Create `coverage/helpers.ts` from `coverageReport.ts` content**

Create `scripts/e2e/run-e2e/coverage/helpers.ts`:
```ts
import { PERCENT_DISPLAY_DECIMALS } from './constants';

export function formatCoveragePercent(coveragePercent: number): string {
  return `${coveragePercent.toFixed(PERCENT_DISPLAY_DECIMALS)}%`;
}
```
Delete the original `coverage/coverageReport.ts`.

- [ ] **Step 6: Update `cdpCoverage.ts` import for sourceMapResolver**

In `coverage/cdpCoverage.ts`, update the import:
```ts
// change:
import { extractInlineSourceMap, findOriginalPosition, getOriginalSourceFiles } from './sourceMapResolver';
// to:
import { extractInlineSourceMap, findOriginalPosition, getOriginalSourceFiles } from './source-map-resolver/sourceMapResolver';
```

- [ ] **Step 7: Update `runE2e.ts` imports**

In `scripts/e2e/run-e2e/runE2e.ts`, update three import paths:
```ts
// change:
import { formatCoveragePercent } from './coverage/coverageReport';
// to:
import { formatCoveragePercent } from './coverage/helpers';

// change:
import { readJestCoverageLineThreshold } from './coverage/readJestCoverageThreshold';
// to:
import { readJestCoverageLineThreshold } from './coverage/read-jest-coverage-threshold/readJestCoverageThreshold';

// change:
} from './coverage/coverageReportGenerator';
// to:
} from './coverage/coverage-report-generator/coverageReportGenerator';
```

- [ ] **Step 8: Run tests to confirm all pass**

```bash
npm test
```
Expected: All tests pass, 0 failures.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor(scripts): reorganize coverage/ — one primary impl file per folder"
```

---

## Task 4: Split `cdpCoverage.ts` (613 lines → ≤150 lines)

Extract interfaces to `interfaces.ts`, utility helpers to `helpers.ts`, and two large function groups into new subfolders.

**Functions to extract:**

| Function | Destination |
|---|---|
| `CoverageRange`, `FunctionCoverage`, `ScriptCoverage`, `CoverageData`, `CoverageSummary`, `MappedCoverageData`, `SourceMappedCoverage` (interfaces) | `coverage/interfaces.ts` |
| `calculateCoverageSummary`, `calculateMappedSummary` | `coverage/coverage-calculator/coverageCalculator.ts` |
| `mapCoverageToSource`, `mapBundleCoverage` | `coverage/coverage-mapper/coverageMapper.ts` |
| `isPluginScript`, `getLineFromOffset`, `getColumnFromOffset`, `isExecutableLine`, `formatCoveragePercent`, `generateCoverageReport`, `saveCoverageData` | `coverage/helpers.ts` (append to existing) |
| `startCoverageCollection`, `stopCoverageCollection`, `takeCoverageDelta`, `loadSourceFiles` | Remain in `coverage/cdpCoverage.ts` |

- [ ] **Step 1: Fill `coverage/interfaces.ts` with all interfaces from `cdpCoverage.ts`**

Open `coverage/cdpCoverage.ts` and move every `export interface` declaration into `coverage/interfaces.ts`. The interfaces are: `CoverageRange`, `FunctionCoverage`, `ScriptCoverage`, `CoverageData`, `CoverageSummary`, `MappedCoverageData`, `SourceMappedCoverage`. Remove them from `cdpCoverage.ts` and add import in `cdpCoverage.ts`:
```ts
import type { CoverageData, CoverageSummary, MappedCoverageData, SourceMappedCoverage } from './interfaces';
```

- [ ] **Step 2: Create `coverage-calculator/` subfolder**

Create `coverage/coverage-calculator/constants.ts` (empty for now):
```ts
// No constants required by this module.
```

Create `coverage/coverage-calculator/interfaces.ts` (empty for now):
```ts
// Interfaces are shared via the parent coverage/interfaces.ts.
```

Create `coverage/coverage-calculator/coverageCalculator.ts` — move `calculateCoverageSummary` and `calculateMappedSummary` out of `cdpCoverage.ts` into this file. Both functions depend on `isPluginScript`, `getLineFromOffset`, and `isExecutableLine` which will live in `coverage/helpers.ts`. Import them:
```ts
import type { CoverageData, CoverageSummary, MappedCoverageData } from '../interfaces';
import { isPluginScript, getLineFromOffset, isExecutableLine } from '../helpers';
```

- [ ] **Step 3: Create `coverage-mapper/` subfolder**

Create `coverage/coverage-mapper/constants.ts` (empty).
Create `coverage/coverage-mapper/interfaces.ts` (empty).

Create `coverage/coverage-mapper/coverageMapper.ts` — move `mapCoverageToSource` and `mapBundleCoverage` out of `cdpCoverage.ts`:
```ts
import type { CoverageData, MappedCoverageData, SourceMappedCoverage } from '../interfaces';
import { calculateMappedSummary } from '../coverage-calculator/coverageCalculator';
import { isPluginScript, getLineFromOffset, getColumnFromOffset, isExecutableLine } from '../helpers';
import { extractInlineSourceMap, findOriginalPosition, getOriginalSourceFiles } from '../source-map-resolver/sourceMapResolver';
```

- [ ] **Step 4: Append utility helpers to `coverage/helpers.ts`**

Add these functions from `cdpCoverage.ts` to `coverage/helpers.ts`:
- `isPluginScript(url: string): boolean`
- `getLineFromOffset(source: string, offset: number): number`
- `getColumnFromOffset(source: string, offset: number): number`
- `isExecutableLine(line: string): boolean`
- `generateCoverageReport(summary: CoverageSummary, coverageData: CoverageData): string`
- `saveCoverageData(coverageData: CoverageData, outputPath: string): void`

Add necessary imports at top of `coverage/helpers.ts`:
```ts
import type { CoverageSummary, CoverageData } from './interfaces';
import { PERCENT_DISPLAY_DECIMALS } from './constants';
```

- [ ] **Step 5: Trim `coverage/cdpCoverage.ts` to keep only the 4 core functions**

After extracting everything, `cdpCoverage.ts` must contain only:
- `startCoverageCollection(cdpClient)`
- `stopCoverageCollection(cdpClient)`
- `takeCoverageDelta(cdpClient)`
- `loadSourceFiles(rootPath)`

Add import for `mapCoverageToSource` re-export if `coverageReportGenerator` imports it from `cdpCoverage`:
```ts
export { mapCoverageToSource } from './coverage-mapper/coverageMapper';
```
(This preserves the public API so `coverageReportGenerator` does not need changes.)

- [ ] **Step 6: Update `runE2e.ts` to import `generateCoverageReport` from `coverage/helpers` instead of `coverage/cdpCoverage`**

In `runE2e.ts`:
```ts
// change:
import { startCoverageCollection, stopCoverageCollection, loadSourceFiles, generateCoverageReport } from './coverage/cdpCoverage';
// to:
import { startCoverageCollection, stopCoverageCollection, loadSourceFiles } from './coverage/cdpCoverage';
import { generateCoverageReport } from './coverage/helpers';
```

- [ ] **Step 7: Run build and tests**

```bash
npm run build
npm test
```
Expected: Build succeeds, all tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(scripts): split cdpCoverage.ts — interfaces, calculator, mapper subfolders"
```

---

## Task 5: Split `coverage-report-generator/coverageReportGenerator.ts` (572 lines → ≤150 lines)

Extract interfaces, helpers, and HTML report generation into separate files within the subfolder.

**Functions to extract:**

| Function/Type | Destination |
|---|---|
| `FileCoverage`, `DetailedCoverageReport` (interfaces) | `coverage-report-generator/interfaces.ts` |
| `analyzeFileCoverage`, `inferBranchType`, `isExecutableLine`, `extractFilePath`, `getLineFromOffset`, `calculateSummaryFromFiles`, `isPluginScript` | `coverage-report-generator/helpers.ts` |
| `generateHtmlReport`, `saveHtmlReport`, `generateUncoveredBranchesReport` | `coverage-report-generator/html-report/htmlReport.ts` |
| `getCoverageClass`, `escapeHtml` | `coverage-report-generator/html-report/helpers.ts` |
| `generateDetailedReport`, `convertMappedToFileCoverage`, `saveReportJson` | Remain in `coverageReportGenerator.ts` |

- [ ] **Step 1: Create `coverage-report-generator/interfaces.ts`**

```ts
import type { CoverageSummary } from '../interfaces';

export interface FileCoverage {
  filePath: string;
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  uncoveredLines: number[];
  uncoveredBranches: Array<{ line: number; type: string }>;
  uncoveredFunctions: string[];
}

export interface DetailedCoverageReport {
  summary: CoverageSummary;
  files: FileCoverage[];
  timestamp: string;
  duration: number;
  sourceMapped: boolean;
}
```

- [ ] **Step 2: Create `coverage-report-generator/helpers.ts`**

Move the following functions from `coverageReportGenerator.ts` into `helpers.ts`: `analyzeFileCoverage`, `inferBranchType`, `isExecutableLine`, `extractFilePath`, `getLineFromOffset`, `calculateSummaryFromFiles`, `isPluginScript`. Export all of them.

Add imports:
```ts
import type { FileCoverage } from './interfaces';
import type { CoverageSummary, ScriptCoverage } from '../interfaces';
```

- [ ] **Step 3: Create `html-report/` subfolder**

Create `coverage-report-generator/html-report/helpers.ts`:
```ts
export function getCoverageClass(coveragePercent: number): string {
  if (coveragePercent >= 80) return 'good';
  if (coveragePercent >= 60) return 'warning';
  return 'danger';
}

export function escapeHtml(text: string): string {
  return text
    .replace(/\u0026/g, '&amp;')
    .replace(/\u003c/g, '&lt;')
    .replace(/\u003e/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

Create `coverage-report-generator/html-report/htmlReport.ts` — move `generateHtmlReport`, `saveHtmlReport`, `generateUncoveredBranchesReport` from `coverageReportGenerator.ts`. Import:
```ts
import * as fs from 'fs';
import type { DetailedCoverageReport } from '../interfaces';
import { getCoverageClass, escapeHtml } from './helpers';
```

- [ ] **Step 4: Trim `coverageReportGenerator.ts`**

Remove all extracted functions and update imports:
```ts
import * as fs from 'fs';

import type { CoverageData, CoverageSummary, SourceMappedCoverage } from '../interfaces';
import { mapCoverageToSource } from '../cdpCoverage';
import type { DetailedCoverageReport, FileCoverage } from './interfaces';
import { analyzeFileCoverage, calculateSummaryFromFiles, extractFilePath, isPluginScript } from './helpers';
export type { FileCoverage, DetailedCoverageReport };
export { generateHtmlReport, saveHtmlReport, generateUncoveredBranchesReport } from './html-report/htmlReport';
```

`coverageReportGenerator.ts` must now only contain: `generateDetailedReport`, `convertMappedToFileCoverage`, `saveReportJson`.

- [ ] **Step 5: Run build and tests**

```bash
npm run build
npm test
```
Expected: Build succeeds, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(scripts): split coverageReportGenerator.ts — interfaces, helpers, html-report"
```

---

## Task 6: Split `coverage/source-map-resolver/sourceMapResolver.ts` (311 lines → ≤150 lines)

Extract interfaces, VLQ constants, and `decodeVLQ` + `parseSourceMap` (helpers) out of the primary file.

**Functions to extract:**

| Function/Type | Destination |
|---|---|
| `SourceMapping`, `ParsedSourceMap` (interfaces) | `source-map-resolver/interfaces.ts` |
| VLQ constants (`VLQ_BASE_SHIFT`, `VLQ_BASE_MASK`, `VLQ_CONTINUATION_BIT`, `VLQ_BASE64_CHARS`, `VLQ_BASE64_DECODE`) | `source-map-resolver/constants.ts` |
| `decodeVLQ`, `parseSourceMap` | `source-map-resolver/helpers.ts` |
| `extractInlineSourceMap`, `findOriginalPosition`, `getOriginalSourceFiles`, `getSourceMapForBundle`, `clearSourceMapCache`, `normalizeSourcePath` | Remain in `sourceMapResolver.ts` |

- [ ] **Step 1: Create `source-map-resolver/interfaces.ts`**

```ts
export interface SourceMapping {
  generatedLine: number;
  generatedColumn: number;
  originalLine: number;
  originalColumn: number;
  sourceIndex: number;
  nameIndex: number | null;
}

export interface ParsedSourceMap {
  sources: string[];
  sourcesContent: string[];
  mappings: SourceMapping[];
  names: string[];
  version: number;
}
```

- [ ] **Step 2: Create `source-map-resolver/constants.ts`**

```ts
export const VLQ_BASE_SHIFT = 5;
export const VLQ_BASE_MASK = (1 << VLQ_BASE_SHIFT) - 1;
export const VLQ_CONTINUATION_BIT = 1 << VLQ_BASE_SHIFT;
export const VLQ_BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Initialize decode map at module load
export const VLQ_BASE64_DECODE: Map<string, number> = new Map();
for (let index = 0; index < VLQ_BASE64_CHARS.length; index++) {
  VLQ_BASE64_DECODE.set(VLQ_BASE64_CHARS[index], index);
}
```

- [ ] **Step 3: Create `source-map-resolver/helpers.ts`**

Move `decodeVLQ` and `parseSourceMap` (currently a private function) from `sourceMapResolver.ts` to `helpers.ts`. Export both.

Add imports:
```ts
import type { ParsedSourceMap, SourceMapping } from './interfaces';
import { VLQ_BASE64_DECODE, VLQ_BASE_MASK, VLQ_CONTINUATION_BIT, VLQ_BASE_SHIFT } from './constants';
```

- [ ] **Step 4: Trim `sourceMapResolver.ts`**

Remove extracted declarations. Add imports from sibling files:
```ts
import * as fs from 'fs';

import type { ParsedSourceMap, SourceMapping } from './interfaces';
import { decodeVLQ, parseSourceMap } from './helpers';
```
Export the interfaces for external consumers:
```ts
export type { ParsedSourceMap, SourceMapping };
```

The primary file now contains only: `extractInlineSourceMap`, `findOriginalPosition`, `getOriginalSourceFiles`, `getSourceMapForBundle`, `clearSourceMapCache`, `normalizeSourcePath` — approximately 120 lines.

- [ ] **Step 5: Run build and tests**

```bash
npm run build
npm test
```
Expected: Build succeeds, all tests pass (including `sourceMapResolver.test.ts`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(scripts): split sourceMapResolver.ts — interfaces, constants, helpers"
```

---

## Task 7: Split `esbuild/coverageInstrumentPlugin.ts` (509 lines → ≤150 lines)

Move the file into a proper subfolder. Extract all interfaces, all constants, and instrumentation helper functions.

- [ ] **Step 1: Read `esbuild/coverageInstrumentPlugin.ts` in full**

Before writing any code, read the entire file to identify: (a) all interfaces, (b) all constants, (c) logical helper functions vs. the plugin factory entry point.

- [ ] **Step 2: Create `esbuild/coverage-instrument-plugin/interfaces.ts`**

Move all `interface` declarations from `coverageInstrumentPlugin.ts` here: `CoverageInstrumentOptions`, `InstrumentedFile`, `BranchInfo`, `FunctionInfo`, `StatementInfo`, `Location`.

- [ ] **Step 3: Create `esbuild/coverage-instrument-plugin/constants.ts`**

Move all module-level constants from `coverageInstrumentPlugin.ts`:
```ts
export const COVERAGE_GLOBAL = '__ONR_COVERAGE__';

// Module-level counters for unique IDs (reset between runs as needed)
export let branchCounter = 0;
export let functionCounter = 0;
export let statementCounter = 0;
```

- [ ] **Step 4: Create `esbuild/coverage-instrument-plugin/helpers.ts`**

Move all instrumentation helper functions (functions that are not the plugin factory itself). Export all of them. Add necessary imports.

- [ ] **Step 5: Create `esbuild/coverage-instrument-plugin/coverageInstrumentPlugin.ts`**

This is the new primary file. It imports from the helpers/interfaces/constants and exports the plugin factory function only. Should be ≤150 lines.

- [ ] **Step 6: Update `esbuild/coverageInstrumentPlugin.ts` to re-export**

The original file becomes a re-export shim so that any external code importing from `esbuild/coverageInstrumentPlugin` still works:
```ts
export { coverageInstrumentPlugin } from './coverage-instrument-plugin/coverageInstrumentPlugin';
```
(Or delete it if nothing imports it from that path — check first with `grep -r "coverageInstrumentPlugin" scripts/ --include="*.ts" --include="*.mjs"`.)

- [ ] **Step 7: Run build and tests**

```bash
npm run build
npm test
```
Expected: Build succeeds, all tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(scripts): split coverageInstrumentPlugin.ts into subfolder"
```

---

## Task 8: Split `e2e/run-e2e/runE2e.ts` (254 lines → ≤150 lines)

Extract `createRunnerPaths`, `createLaunchSession`, and the coverage collection block into `helpers.ts`.

**Functions to extract:**

| Function | Destination |
|---|---|
| `createRunnerPaths` | `run-e2e/helpers.ts` |
| `createLaunchSession` | `run-e2e/helpers.ts` |
| Coverage section logic (lines in `runE2e()` that handle `codeCoverageMode`) | Extract to `collectAndReportCoverage` helper in `run-e2e/helpers.ts` |

- [ ] **Step 1: Create `scripts/e2e/run-e2e/helpers.ts`**

Move `createRunnerPaths` and `createLaunchSession` from `runE2e.ts` to `helpers.ts`. Export both. Keep their imports inside `helpers.ts`.

```ts
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  E2E_VAULT_DIRNAME,
  OBSIDIAN_CONFIG_RELATIVE_PATH,
  OBSIDIAN_EXE_RELATIVE_PATH,
  TEMP_NOTE_FILENAME,
} from '../constants';
import {
  connectLiveObsidian,
  launchFreshObsidian,
  relaunchLiveObsidianDebug,
} from './connectionStrategy/connectionStrategy';

import type { LaunchSession, RunnerPaths } from './interfaces';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

export function createRunnerPaths(): RunnerPaths { ... }
export async function createLaunchSession(...): Promise<LaunchSession> { ... }
```

- [ ] **Step 2: Update `runE2e.ts` to import helpers**

Remove `createRunnerPaths` and `createLaunchSession` from `runE2e.ts`. Remove their now-unused imports. Add:
```ts
import { createRunnerPaths, createLaunchSession } from './helpers';
```

Verify line count is ≤150 (excluding imports). If still over, extract the coverage block to a named function in `helpers.ts`:
```ts
export async function collectAndReportCoverage(
  cdpClient: CdpClient,
  rootPath: string,
  coverageStartTime: number,
  cliArguments: CliArguments,
  coverageDir: string,
): Promise<CoverageSummary>
```

- [ ] **Step 3: Run build and tests**

```bash
npm run build
npm test
```
Expected: Build succeeds, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(scripts): split runE2e.ts — extract helpers"
```

---

## Task 9: Split `hooks/session-start/discoverContext.cjs` (246 lines → ≤150 lines)

Read the full file, identify the primary entry point vs. pure helper functions, and extract helpers.

- [ ] **Step 1: Read the full file**

Read `scripts/hooks/session-start/discoverContext.cjs` in its entirety (246 lines). Identify which functions are pure helpers that can be separated.

- [ ] **Step 2: Create `scripts/hooks/session-start/helpers.cjs`**

Move all helper functions (any function that does not directly compose the exported API) into `helpers.cjs`. Export them via `module.exports`. Import them in `discoverContext.cjs`:
```js
const { helperFunctionName } = require('./helpers.cjs');
```

- [ ] **Step 3: Verify `discoverContext.cjs` is ≤150 lines (excl. requires)**

If still over, continue extracting more functions to `helpers.cjs`.

- [ ] **Step 4: Update `discoverContext.test.cjs` if it imports from helpers**

The test requires specific exports from `discoverContext.cjs`. Ensure any moved functions are still accessible (either re-exported or accessed via `helpers.cjs` directly in tests that need them).

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(scripts): split discoverContext.cjs — extract helpers.cjs"
```

---

## Task 10: Trim `workspaceSetup/workspaceSetup.ts` (161 lines → ≤150 lines)

Extract `evaluateWithTimeout` to `helpers.ts`. This alone brings the primary file from 161 to ~130 lines.

- [ ] **Step 1: Create `workspaceSetup/helpers.ts`**

Move the `evaluateWithTimeout` function from `workspaceSetup.ts` to a new `helpers.ts` file:

```ts
import type { CdpClient } from '../cdpClient/cdpClient';

const CDP_EVALUATE_TIMEOUT_MS = 5000;

export async function evaluateWithTimeout<TResult>(
  cdpClient: CdpClient,
  expression: string,
  awaitPromise = true,
): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      reject(new Error(`CDP evaluate timed out after ${CDP_EVALUATE_TIMEOUT_MS}ms`));
    }, CDP_EVALUATE_TIMEOUT_MS);

    cdpClient
      .eval<TResult>(expression, awaitPromise)
      .then((value) => {
        clearTimeout(timeoutHandle);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
  });
}
```

Remove `CDP_EVALUATE_TIMEOUT_MS` and `evaluateWithTimeout` from `workspaceSetup.ts`. Add import:
```ts
import { evaluateWithTimeout } from './helpers';
```

- [ ] **Step 2: Run build and tests**

```bash
npm run build
npm test
```
Expected: Build succeeds, all tests pass. `workspaceSetup.ts` is ≤150 lines excluding imports.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(scripts): extract evaluateWithTimeout to workspaceSetup/helpers.ts"
```

---

## Self-Review

### Spec coverage

| Violation | Addressed by |
|---|---|
| `tests/` subfolders — 5 files to colocate | Task 1 |
| Empty `tests/` folders — 3 to delete | Task 2 |
| `coverage/` has 5 impl files | Task 3 |
| `cdpCoverage.ts` — 613 lines | Task 4 |
| `coverageReportGenerator.ts` — 572 lines | Task 5 |
| `sourceMapResolver.ts` — 311 lines | Task 6 |
| `coverageInstrumentPlugin.ts` — 509 lines | Task 7 |
| `runE2e.ts` — 254 lines | Task 8 |
| `discoverContext.cjs` — 246 lines | Task 9 |
| `workspaceSetup.ts` — 161 lines | Task 10 |

### Placeholder scan

No `TBD` or `TODO` placeholders present. Task 7 Step 1 and Task 9 Step 1 explicitly require reading the full file first — this is intentional, not a placeholder; those files were not fully read during planning.

### Type consistency

- `CoverageSummary`, `CoverageData` remain in `coverage/interfaces.ts` and are imported by all sub-modules.
- `FileCoverage`, `DetailedCoverageReport` move to `coverage-report-generator/interfaces.ts`.
- `ParsedSourceMap`, `SourceMapping` move to `source-map-resolver/interfaces.ts`.
- `mapCoverageToSource` is re-exported from `coverage/cdpCoverage.ts` so `coverageReportGenerator.ts` does not need its import changed.
