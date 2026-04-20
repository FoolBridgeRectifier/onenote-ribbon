import { execFileSync, spawn } from 'child_process';
import * as fs from 'fs';

import { CDP_LAUNCH_TIMEOUT_MS, POST_KILL_WAIT_MS } from '../constants';
import { connectCdp, fetchJson, findMainPage } from '../cdpClient/cdpClient';
import { pollUntil, sleep } from '../polling/polling';
import {
  ensureTestVault,
  registerTestVault,
  restoreObsidianConfig,
} from '../obsidianVault/obsidianVault';

import type { LaunchSession, RunnerPaths } from '../interfaces';

export async function connectLiveObsidian(cdpPort: number) {
  const webSocketUrl = await findMainPage(cdpPort);
  return connectCdp(webSocketUrl);
}

export async function relaunchLiveObsidianDebug(runnerPaths: RunnerPaths, cdpPort: number) {
  try {
    execFileSync('taskkill', ['/IM', 'Obsidian.exe', '/F'], {
      stdio: 'ignore',
    });
    console.log('      Killed existing Obsidian process.');
    await sleep(POST_KILL_WAIT_MS);
  } catch {
    // Ignore if Obsidian is not already running.
  }

  if (!fs.existsSync(runnerPaths.obsidianExePath)) {
    throw new Error(`Obsidian not found at: ${runnerPaths.obsidianExePath}`);
  }

  const obsidianProcess = spawn(
    runnerPaths.obsidianExePath,
    [`--remote-debugging-port=${cdpPort}`],
    { detached: true, stdio: 'ignore' }
  );

  // Keep the relaunched live Obsidian process independent from the runner lifecycle.
  obsidianProcess.unref();

  const targets = await pollUntil(
    async () => {
      try {
        return await fetchJson<unknown[]>(`http://localhost:${cdpPort}/json`);
      } catch {
        return null;
      }
    },
    {
      interval: 1000,
      label: `CDP on port ${cdpPort}`,
      timeout: CDP_LAUNCH_TIMEOUT_MS,
    }
  );

  console.log(`      Obsidian relaunched in debug mode (${targets.length} CDP targets found).`);

  const webSocketUrl = await findMainPage(cdpPort);
  return connectCdp(webSocketUrl);
}

export async function launchFreshObsidian(
  runnerPaths: RunnerPaths,
  cdpPort: number
): Promise<LaunchSession> {
  try {
    execFileSync('taskkill', ['/IM', 'Obsidian.exe', '/F'], {
      stdio: 'ignore',
    });
    console.log('      Killed existing Obsidian process.');
    await sleep(POST_KILL_WAIT_MS);
  } catch {
    // Ignore if Obsidian is not already running.
  }

  ensureTestVault(runnerPaths);
  const obsidianConfigBackup = registerTestVault(runnerPaths);

  if (!fs.existsSync(runnerPaths.obsidianExePath)) {
    restoreObsidianConfig(runnerPaths.obsidianConfigPath, obsidianConfigBackup);
    throw new Error(`Obsidian not found at: ${runnerPaths.obsidianExePath}`);
  }

  const obsidianProcess = spawn(
    runnerPaths.obsidianExePath,
    [`--remote-debugging-port=${cdpPort}`],
    { detached: false, stdio: 'ignore' }
  );

  const targets = await pollUntil(
    async () => {
      try {
        return await fetchJson<unknown[]>(`http://localhost:${cdpPort}/json`);
      } catch {
        return null;
      }
    },
    {
      interval: 1000,
      label: `CDP on port ${cdpPort}`,
      timeout: CDP_LAUNCH_TIMEOUT_MS,
    }
  );

  console.log(`      Obsidian launched (${targets.length} CDP targets found).`);

  const webSocketUrl = await findMainPage(cdpPort);
  const cdpClient = await connectCdp(webSocketUrl);

  return {
    cdpClient,
    isLiveMode: false,
    obsidianConfigBackup,
    obsidianProcess,
  };
}
