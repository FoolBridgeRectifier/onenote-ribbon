import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
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
import { loadSourceFiles, stopCoverageCollection } from './coverage/cdpCoverage';
import {
  generateDetailedReport,
  generateUncoveredBranchesReport,
  saveHtmlReport,
  saveReportJson,
} from './coverage/coverage-report-generator/coverageReportGenerator';
import { generateCoverageReport } from './coverage/helpers';

import type { CdpClient } from './cdpClient/cdpClient';
import type { CoverageSummary } from './coverage/interfaces';
import type { LaunchSession, RunnerPaths } from './interfaces';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

export function createRunnerPaths(): RunnerPaths {
  return {
    obsidianConfigPath: path.join(os.homedir(), OBSIDIAN_CONFIG_RELATIVE_PATH),
    obsidianExePath: path.join(os.homedir(), OBSIDIAN_EXE_RELATIVE_PATH),
    rootPath: ROOT,
    tempNoteFileName: TEMP_NOTE_FILENAME,
    vaultDirPath: path.join(ROOT, E2E_VAULT_DIRNAME),
  };
}

export async function createLaunchSession(
  runnerPaths: RunnerPaths,
  cdpPort: number,
  launchFresh: boolean
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
        `      No running Obsidian CDP target detected on port ${cdpPort}. Restarting Obsidian in debug mode...`
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

export async function collectCoverageData(
  cdpClient: CdpClient,
  rootPath: string,
  coverageStartTime: number,
  options: { coverageReport: boolean; coverageHtml: boolean }
): Promise<CoverageSummary> {
  console.log('      Collecting code coverage data...');
  const coverageData = await stopCoverageCollection(cdpClient);
  const coverageDuration = Date.now() - coverageStartTime;

  // Load source files for analysis
  const sourceFilesResult = await loadSourceFiles(rootPath);

  // Generate detailed report with source map support, filtering via jest collectCoverageFrom
  const detailedReport = generateDetailedReport(
    coverageData,
    sourceFilesResult.files,
    coverageDuration,
    sourceFilesResult.bundleContent,
    rootPath
  );

  // Save reports to coverage/e2e directory
  const coverageDir = path.join(rootPath, 'coverage', 'e2e');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  if (options.coverageReport) {
    saveReportJson(detailedReport, path.join(coverageDir, 'coverage.json'));
    console.log(`      Coverage JSON saved to: coverage/e2e/coverage.json`);
  }

  if (options.coverageHtml) {
    saveHtmlReport(detailedReport, path.join(coverageDir, 'index.html'));
    console.log(`      Coverage HTML saved to: coverage/e2e/index.html`);
  }

  // Save uncovered branches report
  const uncoveredReport = generateUncoveredBranchesReport(detailedReport);
  fs.writeFileSync(path.join(coverageDir, 'uncovered-branches.md'), uncoveredReport);

  // Print console report
  console.log('\n' + generateCoverageReport(detailedReport.summary, coverageData));

  return detailedReport.summary;
}
