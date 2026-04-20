import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  E2E_VAULT_DIRNAME,
  OBSIDIAN_CONFIG_RELATIVE_PATH,
  OBSIDIAN_EXE_RELATIVE_PATH,
  TEMP_NOTE_FILENAME,
} from '../constants';
import { RUNNER_SEPARATOR } from './constants';
import {
  connectLiveObsidian,
  launchFreshObsidian,
  relaunchLiveObsidianDebug,
} from './connectionStrategy/connectionStrategy';
import {
  cleanupTestVault,
  restoreObsidianConfig,
} from './obsidianVault/obsidianVault';
import { parseCliArguments } from './parseCliArguments/parseCliArguments';
import { runSuites } from './suiteExecution/suiteExecution';
import { formatCoveragePercent, generateCoverageReport } from './coverage/helpers';
import { readJestCoverageLineThreshold } from './coverage/read-jest-coverage-threshold/readJestCoverageThreshold';
import {
  startCoverageCollection,
  stopCoverageCollection,
  loadSourceFiles,
} from './coverage/cdpCoverage';
import {
  generateDetailedReport,
  saveReportJson,
  saveHtmlReport,
  generateUncoveredBranchesReport,
} from './coverage/coverage-report-generator/coverageReportGenerator';
import {
  cleanupTempNote,
  dismissTrustModal,
  ensureEditorOpen,
  waitForWorkspaceAndRibbon,
} from './workspaceSetup/workspaceSetup';

import type { LaunchSession, RunnerPaths } from './interfaces';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

function createRunnerPaths(): RunnerPaths {
  return {
    obsidianConfigPath: path.join(os.homedir(), OBSIDIAN_CONFIG_RELATIVE_PATH),
    obsidianExePath: path.join(os.homedir(), OBSIDIAN_EXE_RELATIVE_PATH),
    rootPath: ROOT,
    tempNoteFileName: TEMP_NOTE_FILENAME,
    vaultDirPath: path.join(ROOT, E2E_VAULT_DIRNAME),
  };
}

async function createLaunchSession(
  runnerPaths: RunnerPaths,
  cdpPort: number,
  launchFresh: boolean,
): Promise<LaunchSession> {
  if (!launchFresh) {
    try {
      const cdpClient = await connectLiveObsidian(cdpPort);

      return {
        cdpClient,
        isLiveMode: true,
        obsidianConfigBackup: null,
        obsidianProcess: null,
      };
    } catch {
      console.log(
        `      No running Obsidian CDP target detected on port ${cdpPort}. Restarting Obsidian in debug mode...`,
      );

      const cdpClient = await relaunchLiveObsidianDebug(runnerPaths, cdpPort);

      return {
        cdpClient,
        isLiveMode: true,
        obsidianConfigBackup: null,
        obsidianProcess: null,
      };
    }
  }

  return launchFreshObsidian(runnerPaths, cdpPort);
}

export async function runE2e() {
  const cliArguments = parseCliArguments(process.argv.slice(2));
  const runnerPaths = createRunnerPaths();

  console.log('OneNote Ribbon — E2E Integration Test Runner');
  console.log(RUNNER_SEPARATOR);

  console.log('\n[1/4] Building plugin...');
  execFileSync('node', ['esbuild.config.mjs'], {
    cwd: runnerPaths.rootPath,
    stdio: 'inherit',
  });

  console.log(
    cliArguments.launchFresh
      ? '\n[2/4] Setting up test vault and launching Obsidian...'
      : `\n[2/4] Checking for running Obsidian on port ${cliArguments.cdpPort}...`,
  );

  const launchSession = await createLaunchSession(
    runnerPaths,
    cliArguments.cdpPort,
    cliArguments.launchFresh,
  );

  if (launchSession.isLiveMode) {
    console.log('      Connected to live Obsidian.');
  }

  try {
    console.log('\n[3/4] Waiting for Obsidian workspace and plugin to load...');

    await waitForWorkspaceAndRibbon(launchSession.cdpClient);
    console.log('      Obsidian loaded, ribbon detected.');

    await dismissTrustModal(launchSession.cdpClient);
    await ensureEditorOpen(
      launchSession.cdpClient,
      runnerPaths.tempNoteFileName,
    );
    console.log('      Active editor ready.');

    // Start code coverage collection if requested
    let coverageStartTime: number | null = null;
    if (cliArguments.codeCoverageMode) {
      console.log('      Starting code coverage collection...');
      await startCoverageCollection(launchSession.cdpClient);
      coverageStartTime = Date.now();
    }

    const suiteSummary = await runSuites(
      launchSession.cdpClient,
      runnerPaths.rootPath,
      cliArguments.suiteFilter,
    );

    // Collect and report code coverage if requested
    let codeCoverageSummary = null;
    if (cliArguments.codeCoverageMode && coverageStartTime !== null) {
      console.log('      Collecting code coverage data...');
      const coverageData = await stopCoverageCollection(launchSession.cdpClient);
      const coverageDuration = Date.now() - coverageStartTime;

      // Load source files for analysis
      const sourceFilesResult = await loadSourceFiles(runnerPaths.rootPath);

      // Generate detailed report with source map support
      const detailedReport = generateDetailedReport(
        coverageData,
        sourceFilesResult.files,
        coverageDuration,
        sourceFilesResult.bundleContent,
      );
      codeCoverageSummary = detailedReport.summary;

      // Save reports
      const coverageDir = path.join(runnerPaths.rootPath, 'coverage', 'e2e');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      // Save JSON report
      if (cliArguments.coverageReport) {
        saveReportJson(detailedReport, path.join(coverageDir, 'coverage.json'));
        console.log(`      Coverage JSON saved to: coverage/e2e/coverage.json`);
      }

      // Save HTML report
      if (cliArguments.coverageHtml) {
        saveHtmlReport(detailedReport, path.join(coverageDir, 'index.html'));
        console.log(`      Coverage HTML saved to: coverage/e2e/index.html`);
      }

      // Save uncovered branches report
      const uncoveredReport = generateUncoveredBranchesReport(detailedReport);
      fs.writeFileSync(
        path.join(coverageDir, 'uncovered-branches.md'),
        uncoveredReport,
      );

      // Print console report
      console.log('\n' + generateCoverageReport(codeCoverageSummary, coverageData));
    }

    let coverageFailed = false;

    // Check code coverage threshold if applicable
    if (
      cliArguments.codeCoverageMode &&
      codeCoverageSummary &&
      cliArguments.coverageThreshold !== null
    ) {
      if (codeCoverageSummary.overallCoverage < cliArguments.coverageThreshold) {
        coverageFailed = true;
        console.log(
          `  Code coverage threshold not met: expected ${cliArguments.coverageThreshold}%, got ${formatCoveragePercent(codeCoverageSummary.overallCoverage)}`,
        );
      }
    }

    console.log(`\n${RUNNER_SEPARATOR}`);
    console.log(
      `  Results: ${suiteSummary.totalPassed} passed, ${suiteSummary.totalFailed} failed  (${suiteSummary.suitesToRun.length} suite(s))`,
    );

    if (suiteSummary.failedSuites.length > 0) {
      console.log(`  Failed suites: ${suiteSummary.failedSuites.join(', ')}`);
    }

    console.log(RUNNER_SEPARATOR);

    if (launchSession.isLiveMode) {
      await cleanupTempNote(
        launchSession.cdpClient,
        runnerPaths.tempNoteFileName,
      );
    }

    launchSession.cdpClient.close();
    process.exitCode = suiteSummary.totalFailed > 0 || coverageFailed ? 1 : 0;
  } finally {
    if (launchSession.obsidianProcess) {
      launchSession.obsidianProcess.kill();
      console.log('Obsidian process terminated.');
    }

    if (launchSession.obsidianConfigBackup) {
      restoreObsidianConfig(
        runnerPaths.obsidianConfigPath,
        launchSession.obsidianConfigBackup,
      );
      console.log('obsidian.json restored.');
    }

    if (!cliArguments.keepVault && launchSession.obsidianProcess) {
      cleanupTestVault(runnerPaths.vaultDirPath);
      console.log('Test vault cleaned up.');
    }
  }
}
