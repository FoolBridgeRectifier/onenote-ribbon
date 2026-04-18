import type { ExplicitRuleResult, HookRuleResult } from './interfaces';
import { HOME_HOOK_RULE_COUNT } from './constants';

export type { ExplicitRuleResult, HookRuleResult };
export { HOME_HOOK_RULE_COUNT };

export function buildRuleResults(
  ruleResultsById: Record<number, ExplicitRuleResult>,
  totalRuleCount = HOME_HOOK_RULE_COUNT,
): HookRuleResult[] {
  const missingRuleIds: number[] = [];
  const expandedRuleResults: HookRuleResult[] = [];

  for (let ruleId = 1; ruleId <= totalRuleCount; ruleId += 1) {
    const ruleResult = ruleResultsById[ruleId];

    if (!ruleResult) {
      missingRuleIds.push(ruleId);
      continue;
    }

    expandedRuleResults.push({
      test: `rule-${String(ruleId).padStart(3, '0')}`,
      pass: ruleResult.pass,
      details: ruleResult.details,
    });
  }

  if (missingRuleIds.length > 0) {
    throw new Error(
      `Missing explicit rule coverage for ids: ${missingRuleIds.join(', ')}`,
    );
  }

  return expandedRuleResults;
}
