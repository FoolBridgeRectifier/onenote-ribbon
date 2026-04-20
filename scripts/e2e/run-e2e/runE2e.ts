import { execFileSync } from 'child_process';

import { RUNNER_SEPARATOR } from './constants';
import { collectCoverageData, createLaunchSession, createRunnerPaths } from './helpers';
import {
  cleanupTestVault,
  restoreObsidianConfig,
} from './obsidianVault/obsidianVault';
import { parseCliArguments } from './parseCliArguments/parseCliArguments';
import { runSuites } from './suiteExecution/suiteExecution';
import { formatCoveragePercent } from './coverage/helpers';
import { startCoverageCollection } from './coverage/cdpCoverage';
import {
  cleanupTempNote,
  dismissTrustModal,
  ensureEditorOpen,
  waitForWorkspaceAndRibbon,
} from './workspaceSetup/workspaceSetup';

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
      codeCoverageSummary = await collectCoverageData(
        launchSession.cdpClient,
        runnerPaths.rootPath,
        coverageStartTime,
        { coverageReport: cliArguments.coverageReport, coverageHtml: cliArguments.coverageHtml },
      );
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
