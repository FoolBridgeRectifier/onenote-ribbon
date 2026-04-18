export type {
  ExplicitRuleResult,
  HookRuleResult,
} from '../../helpers/interfaces';

export type RuleIdGroup = readonly number[];

export interface HomeSuiteContext {
  commandCalls: string[];
  clickByCommand: (commandId: string) => void;
  editor: any;
  recordRules: (ruleIds: RuleIdGroup, pass: boolean, details: string) => void;
  selectToken: (tokenValue: string) => void;
  wait: (milliseconds: number) => Promise<void>;
}

export type HomeSuiteCallback = (
  context: HomeSuiteContext,
) => Promise<void> | void;
