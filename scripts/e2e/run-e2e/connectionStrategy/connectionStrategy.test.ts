/** @jest-environment node */

const execFileSyncMock = jest.fn();
const spawnMock = jest.fn();
const existsSyncMock = jest.fn();
const pollUntilMock = jest.fn();
const fetchJsonMock = jest.fn();
const findMainPageMock = jest.fn();
const connectCdpMock = jest.fn();

jest.mock('child_process', () => ({
  execFileSync: (...arguments_: unknown[]) => execFileSyncMock(...arguments_),
  spawn: (...arguments_: unknown[]) => spawnMock(...arguments_),
}));

jest.mock('fs', () => ({
  existsSync: (...arguments_: unknown[]) => existsSyncMock(...arguments_),
}));

jest.mock('../polling/polling', () => ({
  pollUntil: (...arguments_: unknown[]) => pollUntilMock(...arguments_),
  sleep: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../cdpClient/cdpClient', () => ({
  connectCdp: (...arguments_: unknown[]) => connectCdpMock(...arguments_),
  fetchJson: (...arguments_: unknown[]) => fetchJsonMock(...arguments_),
  findMainPage: (...arguments_: unknown[]) => findMainPageMock(...arguments_),
}));

import { relaunchLiveObsidianDebug } from './connectionStrategy';

import type { RunnerPaths } from '../interfaces';

describe('relaunchLiveObsidianDebug', () => {
  const runnerPaths: RunnerPaths = {
    obsidianConfigPath: 'config-path',
    obsidianExePath: 'C:/Users/test/AppData/Local/Programs/Obsidian/Obsidian.exe',
    rootPath: 'root-path',
    tempNoteFileName: 'temp-note',
    vaultDirPath: 'vault-path',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    existsSyncMock.mockReturnValue(true);
    pollUntilMock.mockResolvedValue([{}, {}]);
    findMainPageMock.mockResolvedValue('ws://localhost:9222/main');
    connectCdpMock.mockResolvedValue({ send: jest.fn() });
    spawnMock.mockReturnValue({ unref: jest.fn() });
  });

  it('kills Obsidian, relaunches with debug port, and returns a CDP client', async () => {
    const cdpClient = await relaunchLiveObsidianDebug(runnerPaths, 9222);

    expect(execFileSyncMock).toHaveBeenCalledWith('taskkill', ['/IM', 'Obsidian.exe', '/F'], {
      stdio: 'ignore',
    });

    expect(spawnMock).toHaveBeenCalledWith(
      runnerPaths.obsidianExePath,
      ['--remote-debugging-port=9222'],
      {
        detached: true,
        stdio: 'ignore',
      }
    );

    expect(pollUntilMock).toHaveBeenCalled();
    expect(findMainPageMock).toHaveBeenCalledWith(9222);
    expect(connectCdpMock).toHaveBeenCalledWith('ws://localhost:9222/main');
    expect(cdpClient).toEqual({ send: expect.any(Function) });
  });

  it('continues relaunch when taskkill fails', async () => {
    execFileSyncMock.mockImplementation(() => {
      throw new Error('taskkill failed');
    });

    await relaunchLiveObsidianDebug(runnerPaths, 9222);

    expect(spawnMock).toHaveBeenCalledTimes(1);
  });

  it('throws when Obsidian executable does not exist', async () => {
    existsSyncMock.mockReturnValue(false);

    await expect(relaunchLiveObsidianDebug(runnerPaths, 9222)).rejects.toThrow(
      `Obsidian not found at: ${runnerPaths.obsidianExePath}`
    );

    expect(spawnMock).not.toHaveBeenCalled();
  });
});
