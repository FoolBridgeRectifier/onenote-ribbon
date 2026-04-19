export interface RuleCoverageSummary {
  coveredRuleCount: number;
  coveragePercent: number;
  failedRuleIds: number[];
  passedRuleCount: number;
  totalRuleCount: number;
  uncoveredRuleIds: number[];
}
