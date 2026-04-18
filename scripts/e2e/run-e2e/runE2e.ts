import { execFileSync } from 'child_process';
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

    const suiteSummary = await runSuites(
      launchSession.cdpClient,
      runnerPaths.rootPath,
      cliArguments.suiteFilter,
    );

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
    process.exitCode = suiteSummary.totalFailed > 0 ? 1 : 0;
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
