import fs from 'fs';
import path from 'path';

import {
  BUILD_ARTIFACT_FILE_NAMES,
  TEST_NOTE_CONTENT,
  TEST_PLUGIN_DIRECTORY,
  TEST_VAULT_KEY,
} from '../constants';

import type { ObsidianConfig, RunnerPaths } from '../interfaces';

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function writeIfMissing(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
}

export function cleanupTestVault(vaultDirPath: string) {
  if (fs.existsSync(vaultDirPath)) {
    fs.rmSync(vaultDirPath, { force: true, recursive: true });
  }
}

export function ensureTestVault(runnerPaths: RunnerPaths) {
  const pluginDirPath = path.join(
    runnerPaths.vaultDirPath,
    TEST_PLUGIN_DIRECTORY,
  );

  fs.mkdirSync(pluginDirPath, { recursive: true });

  writeIfMissing(
    path.join(runnerPaths.vaultDirPath, '.obsidian/app.json'),
    JSON.stringify(
      { legacyEditor: false, livePreview: true, safeMode: false },
      null,
      2,
    ),
  );

  writeJson(
    path.join(runnerPaths.vaultDirPath, '.obsidian/community-plugins.json'),
    ['onenote-ribbon'],
  );

  writeJson(
    path.join(runnerPaths.vaultDirPath, '.obsidian/core-plugins.json'),
    {
      'file-explorer': true,
      'global-search': true,
      'markdown-importer': false,
      'word-count': false,
    },
  );

  writeJson(path.join(runnerPaths.vaultDirPath, '.obsidian/workspace.json'), {
    active: 'e2e-leaf',
    lastOpenFiles: [runnerPaths.tempNoteFileName],
    left: {
      children: [],
      direction: 'horizontal',
      id: 'e2e-left',
      type: 'split',
      width: 170,
    },
    main: {
      children: [
        {
          id: 'e2e-leaf',
          state: {
            state: {
              backlinks: false,
              file: runnerPaths.tempNoteFileName,
              mode: 'source',
            },
            type: 'markdown',
          },
          type: 'leaf',
        },
      ],
      direction: 'vertical',
      id: 'e2e-main',
      type: 'split',
    },
    right: {
      children: [],
      direction: 'horizontal',
      id: 'e2e-right',
      type: 'split',
      width: 170,
    },
  });

  writeIfMissing(
    path.join(runnerPaths.vaultDirPath, runnerPaths.tempNoteFileName),
    TEST_NOTE_CONTENT,
  );

  for (const artifactFileName of BUILD_ARTIFACT_FILE_NAMES) {
    const sourceFilePath = path.join(runnerPaths.rootPath, artifactFileName);

    if (fs.existsSync(sourceFilePath)) {
      fs.copyFileSync(
        sourceFilePath,
        path.join(pluginDirPath, artifactFileName),
      );
    }
  }

  console.log(`Test vault ready: ${runnerPaths.vaultDirPath}`);
}

export function registerTestVault(runnerPaths: RunnerPaths) {
  const rawObsidianConfig = fs.readFileSync(
    runnerPaths.obsidianConfigPath,
    'utf8',
  );
  const parsedObsidianConfig = JSON.parse(rawObsidianConfig) as ObsidianConfig;

  for (const vaultKey of Object.keys(parsedObsidianConfig.vaults)) {
    delete parsedObsidianConfig.vaults[vaultKey].open;
  }

  parsedObsidianConfig.vaults[TEST_VAULT_KEY] = {
    open: true,
    path: runnerPaths.vaultDirPath.replace(/\//g, '\\'),
    ts: Date.now(),
  };

  fs.writeFileSync(
    runnerPaths.obsidianConfigPath,
    JSON.stringify(parsedObsidianConfig, null, 2),
  );

  return rawObsidianConfig;
}

export function restoreObsidianConfig(
  obsidianConfigPath: string,
  backupConfig: string,
) {
  fs.writeFileSync(obsidianConfigPath, backupConfig);
}
