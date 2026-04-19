import type { SuiteTestResult } from '../../helpers/interfaces';

export type { SuiteTestResult };

export interface HomeSuiteContext {
  commandCalls: string[];
  clickByCommand: (commandId: string) => void;
  editor: any;
  selectToken: (tokenValue: string) => void;
  wait: (milliseconds: number) => Promise<void>;
}

export type HomeSuiteCallback = (
  context: HomeSuiteContext,
) => Promise<void> | void;
