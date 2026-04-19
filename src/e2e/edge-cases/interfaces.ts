/**
 * Interfaces for Edge Cases E2E Test Suite
 */

export interface EdgeCaseTestContext {
  description: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface EdgeCaseResult {
  ruleId: number;
  pass: boolean;
  details: string;
}
