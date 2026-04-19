import * as fs from 'fs';
import * as path from 'path';

const COVERAGE_LINES_PATTERN =
  /coverageThreshold\s*:\s*\{[\s\S]*?global\s*:\s*\{[\s\S]*?lines\s*:\s*(\d+(?:\.\d+)?)/m;

export function readJestCoverageLineThreshold(
  rootPath: string,
): number | null {
  const jestConfigFilePath = path.join(rootPath, 'jest.config.js');

  if (!fs.existsSync(jestConfigFilePath)) {
    return null;
  }

  try {
    const jestConfigContent = fs.readFileSync(jestConfigFilePath, 'utf8');
    const thresholdMatch = jestConfigContent.match(COVERAGE_LINES_PATTERN);

    if (!thresholdMatch) {
      return null;
    }

    const parsedThreshold = Number.parseFloat(thresholdMatch[1]);

    return Number.isNaN(parsedThreshold) ? null : parsedThreshold;
  } catch {
    return null;
  }
}
