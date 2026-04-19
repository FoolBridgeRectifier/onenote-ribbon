/** @jest-environment node */

import {
  calculateRuleCoverage,
  formatCoveragePercent,
} from '../coverageReport';

import type { SuiteResult } from '../../../../interfaces';

describe('calculateRuleCoverage', () => {
  it('returns 100% when all target rules are covered and passed', () => {
    const results: SuiteResult[] = [
      { test: 'rule-001', pass: true },
      { test: 'rule-002', pass: true },
      { test: 'rule-003', pass: true },
    ];

    const coverage = calculateRuleCoverage(results, [1, 2, 3]);

    expect(coverage).toEqual({
      coveredRuleCount: 3,
      coveragePercent: 100,
      failedRuleIds: [],
      passedRuleCount: 3,
      totalRuleCount: 3,
      uncoveredRuleIds: [],
    });
  });

  it('tracks uncovered and failed target rules separately', () => {
    const results: SuiteResult[] = [
      { test: 'rule-001', pass: true },
      { test: 'rule-002', pass: false },
    ];

    const coverage = calculateRuleCoverage(results, [1, 2, 3]);

    expect(coverage.uncoveredRuleIds).toEqual([3]);
    expect(coverage.failedRuleIds).toEqual([2]);
    expect(coverage.coveredRuleCount).toBe(2);
    expect(coverage.passedRuleCount).toBe(1);
    expect(coverage.coveragePercent).toBeCloseTo(33.33, 2);
  });

  it('ignores non-rule test labels', () => {
    const results: SuiteResult[] = [
      { test: 'opens ribbon shell', pass: true },
      { test: 'rule-001', pass: true },
    ];

    const coverage = calculateRuleCoverage(results, [1, 2]);

    expect(coverage.coveredRuleCount).toBe(1);
    expect(coverage.uncoveredRuleIds).toEqual([2]);
  });

  it('marks rule as failed when any matching result fails', () => {
    const results: SuiteResult[] = [
      { test: 'rule-005', pass: true },
      { test: 'rule-005', pass: false },
    ];

    const coverage = calculateRuleCoverage(results, [5]);

    expect(coverage.failedRuleIds).toEqual([5]);
    expect(coverage.passedRuleCount).toBe(0);
    expect(coverage.coveragePercent).toBe(0);
  });
});

describe('formatCoveragePercent', () => {
  it('formats with two decimal places', () => {
    expect(formatCoveragePercent(7.5)).toBe('7.50%');
  });
});
