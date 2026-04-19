import {
  PERCENT_DISPLAY_DECIMALS,
  PERCENT_MULTIPLIER,
  RULE_TEST_NAME_PATTERN,
} from './constants';

import type { SuiteResult } from '../../interfaces';
import type { RuleCoverageSummary } from './interfaces';

function parseRuleId(testName: string): number | null {
  const ruleMatch = testName.match(RULE_TEST_NAME_PATTERN);

  if (!ruleMatch) {
    return null;
  }

  return Number.parseInt(ruleMatch[1], 10);
}

export function calculateRuleCoverage(
  suiteResults: SuiteResult[],
  targetRuleIds: readonly number[],
): RuleCoverageSummary {
  const seenRulePassById = new Map<number, boolean>();
  const targetRuleSet = new Set<number>(targetRuleIds);

  suiteResults.forEach((suiteResult) => {
    const parsedRuleId = parseRuleId(suiteResult.test);

    if (parsedRuleId === null || !targetRuleSet.has(parsedRuleId)) {
      return;
    }

    const previousPass = seenRulePassById.get(parsedRuleId);

    if (previousPass === false) {
      return;
    }

    seenRulePassById.set(parsedRuleId, suiteResult.pass);
  });

  const uncoveredRuleIds = targetRuleIds.filter(
    (ruleId) => !seenRulePassById.has(ruleId),
  );

  const failedRuleIds = targetRuleIds.filter(
    (ruleId) => seenRulePassById.get(ruleId) === false,
  );

  const passedRuleCount = targetRuleIds.filter(
    (ruleId) => seenRulePassById.get(ruleId) === true,
  ).length;

  const coveredRuleCount = seenRulePassById.size;
  const totalRuleCount = targetRuleIds.length;
  const coveragePercent =
    totalRuleCount === 0
      ? PERCENT_MULTIPLIER
      : (passedRuleCount / totalRuleCount) * PERCENT_MULTIPLIER;

  return {
    coveredRuleCount,
    coveragePercent,
    failedRuleIds,
    passedRuleCount,
    totalRuleCount,
    uncoveredRuleIds,
  };
}

export function formatCoveragePercent(coveragePercent: number): string {
  return `${coveragePercent.toFixed(PERCENT_DISPLAY_DECIMALS)}%`;
}
