'use strict';

/**
 * Jest globalTeardown — enforces a minimum coverage percentage on every
 * individual file that was collected.  Jest's built-in coverageThreshold only
 * aggregates across all matched files, not per individual file.  This script
 * reads the coverage-final.json that Istanbul writes before globalTeardown
 * runs, then fails the process if any single file falls below the threshold.
 */

const fs = require('fs');
const path = require('path');

const { PER_FILE_THRESHOLD } = require('./constants.cjs');
const { statementPercent, branchPercent, linePercent, displayPath } = require('./helpers.cjs');

/**
 * Calculates per-metric failures for a single file's Istanbul coverage entry.
 * Returns an array of human-readable failure strings (empty when all pass).
 * @param {{ s: Record<string, number>, f: Record<string, number>, b: Record<string, number[]>, statementMap: Record<string, { start: { line: number } }> }} fileCoverage
 * @returns {string[]}
 */
function collectFileFailures(fileCoverage) {
  const statements = statementPercent(fileCoverage.s ?? {});
  const functions = statementPercent(fileCoverage.f ?? {});
  const branches = branchPercent(fileCoverage.b ?? {});
  const lines = linePercent(fileCoverage.statementMap ?? {}, fileCoverage.s ?? {});

  const failures = [];
  if (statements < PER_FILE_THRESHOLD) failures.push(`statements: ${statements.toFixed(1)}%`);
  if (functions < PER_FILE_THRESHOLD) failures.push(`functions: ${functions.toFixed(1)}%`);
  if (branches < PER_FILE_THRESHOLD) failures.push(`branches: ${branches.toFixed(1)}%`);
  if (lines < PER_FILE_THRESHOLD) failures.push(`lines: ${lines.toFixed(1)}%`);
  return failures;
}

/**
 * Jest globalTeardown entry point.
 * @param {import('@jest/types').Config.GlobalConfig} globalConfig
 */
module.exports = async function perFileCoverageThreshold(globalConfig) {
  // Only enforce when coverage collection is active
  if (!globalConfig.collectCoverage) {
    return;
  }

  // coverageDirectory in globalConfig is already an absolute path resolved by Jest
  const coverageFinalPath = path.join(
    globalConfig.coverageDirectory ?? path.join(globalConfig.rootDir, 'coverage'),
    'coverage-final.json',
  );

  if (!fs.existsSync(coverageFinalPath)) {
    console.warn(
      `\n[perFileCoverageThreshold] coverage-final.json not found at ${coverageFinalPath} — skipping per-file check.\n`,
    );
    return;
  }

  const coverageFinal = JSON.parse(fs.readFileSync(coverageFinalPath, 'utf8'));
  const failures = [];

  for (const [filePath, fileCoverage] of Object.entries(coverageFinal)) {
    const fileFailures = collectFileFailures(fileCoverage);
    if (fileFailures.length > 0) {
      failures.push({ filePath, fileFailures });
    }
  }

  if (failures.length === 0) {
    return;
  }

  process.stdout.write('\n');
  process.stdout.write(
    `Jest: ${failures.length} file(s) below the ${PER_FILE_THRESHOLD}% per-file coverage threshold:\n\n`,
  );

  for (const { filePath, fileFailures } of failures) {
    const shortPath = displayPath(filePath, globalConfig.rootDir);
    process.stdout.write(`  ${shortPath}\n`);
    for (const failureMessage of fileFailures) {
      process.stdout.write(`    - ${failureMessage}\n`);
    }
  }

  process.stdout.write('\n');
  process.exitCode = 1;
};

// Export helpers for testing without exposing them on the default export
module.exports.collectFileFailures = collectFileFailures;
