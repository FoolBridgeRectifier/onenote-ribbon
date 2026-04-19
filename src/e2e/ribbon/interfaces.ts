/**
 * Interfaces for Ribbon Components E2E Test Suite
 */

export interface RibbonComponentTestContext {
  description: string;
}

export interface RibbonComponentResult {
  ruleId: number;
  pass: boolean;
  details: string;
}
