import type { ChildProcess } from 'child_process';

export interface ParsedCliArguments {
  cdpPort: number;
  codeCoverageMode: boolean;
  coverageHtml: boolean;
  coverageReport: boolean;
  coverageThreshold: number | null;
  keepVault: boolean;
  launchFresh: boolean;
  suiteFilter: string[] | null;
}

export interface RunnerPaths {
  rootPath: string;
  obsidianConfigPath: string;
  obsidianExePath: string;
  tempNoteFileName: string;
  vaultDirPath: string;
}

export interface CdpPendingRequest {
  reject: (error: Error) => void;
  resolve: (value: unknown) => void;
  timeoutHandle: ReturnType<typeof setTimeout>;
}

export interface CdpProtocolResponse {
  error?: { message: string };
  id?: number;
  result?: unknown;
}

export interface CdpRuntimeEvaluateResponse {
  exceptionDetails?: {
    exception?: { description?: string };
    text?: string;
  };
  result?: { value?: unknown };
}

export interface CdpTarget {
  type: string;
  url?: string;
  webSocketDebuggerUrl?: string;
}

export interface ObsidianVaultConfig {
  open?: boolean;
  path: string;
  ts: number;
}

export interface ObsidianConfig {
  vaults: Record<string, ObsidianVaultConfig>;
}

export interface LaunchSession {
  cdpClient: import('./cdpClient').CdpClient;
  isLiveMode: boolean;
  obsidianConfigBackup: string | null;
  obsidianProcess: ChildProcess | null;
}

export interface SuiteRunTotals {
  failed: number;
  passed: number;
}
