import { readJestConfigArray } from './helpers';

/**
 * Converts a glob pattern to a RegExp.
 * Handles **, *, and {a,b} brace groups used in jest collectCoverageFrom patterns.
 */
export function globToRegex(globPattern: string): RegExp {
  let regexString = '';
  let index = 0;

  while (index < globPattern.length) {
    const char = globPattern[index];

    if (char === '*' && globPattern[index + 1] === '*') {
      // ** matches any path segment including slashes
      regexString += '.*';
      index += 2;
      // Consume a trailing slash after ** so src/**/ doesn't produce src/.*/
      if (globPattern[index] === '/') {
        index++;
      }
    } else if (char === '*') {
      // * matches any sequence that does not cross a directory boundary
      regexString += '[^/]*';
      index++;
    } else if (char === '{') {
      // {a,b,c} expands to a non-capturing alternation group (?:a|b|c)
      const closingBrace = globPattern.indexOf('}', index);

      if (closingBrace >= 0) {
        const alternatives = globPattern.slice(index + 1, closingBrace).split(',');
        regexString += `(?:${alternatives.join('|')})`;
        index = closingBrace + 1;
      } else {
        regexString += '\\{';
        index++;
      }
    } else if ('.+^$|[]\\()'.includes(char)) {
      // Escape regex special characters that appear literally in glob patterns
      regexString += `\\${char}`;
      index++;
    } else {
      regexString += char;
      index++;
    }
  }

  return new RegExp(`^${regexString}$`);
}

/**
 * Strips leading ../ and ./ sequences from a source map path so it becomes
 * project-relative (e.g. ../../src/foo.ts → src/foo.ts).
 */
export function normalizeRawSourcePath(rawPath: string): string {
  return rawPath.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
}

/**
 * Returns true when the given normalized source path should be included in
 * coverage, applying the same include/exclude rules as jest's collectCoverageFrom.
 * When ignorePatterns is provided it also applies jest's coveragePathIgnorePatterns
 * (raw regex strings), giving exact parity with jest's full coverage configuration.
 *
 * If collectCoverageFromPatterns is empty every file is accepted (no config available).
 */
export function shouldIncludeSourceFile(
  normalizedPath: string,
  collectCoverageFromPatterns: string[],
  ignorePatterns: string[] = []
): boolean {
  if (collectCoverageFromPatterns.length === 0) {
    return true;
  }

  const includePatterns = collectCoverageFromPatterns.filter((pattern) => !pattern.startsWith('!'));
  const excludePatterns = collectCoverageFromPatterns
    .filter((pattern) => pattern.startsWith('!'))
    .map((pattern) => pattern.slice(1));

  const isIncluded = includePatterns.some((pattern) => globToRegex(pattern).test(normalizedPath));

  if (!isIncluded) {
    return false;
  }

  const isExcluded = excludePatterns.some((pattern) => globToRegex(pattern).test(normalizedPath));

  if (isExcluded) {
    return false;
  }

  // Apply coveragePathIgnorePatterns as raw regex patterns (same as jest)
  return !matchesIgnorePattern(normalizedPath, ignorePatterns);
}

/**
 * Returns true when normalizedPath matches any of the raw regex strings from
 * jest's coveragePathIgnorePatterns.  Each entry is treated as a regex pattern,
 * mirroring the way jest applies coveragePathIgnorePatterns.
 */
export function matchesIgnorePattern(normalizedPath: string, ignorePatterns: string[]): boolean {
  return ignorePatterns.some((rawPattern) => {
    try {
      return new RegExp(rawPattern).test(normalizedPath);
    } catch {
      return false;
    }
  });
}

/**
 * Reads the coveragePathIgnorePatterns array from jest.config.js.
 * Returns an empty array when the config cannot be read.
 */
export function readCoveragePathIgnorePatterns(rootPath: string): string[] {
  return readJestConfigArray(rootPath, 'coveragePathIgnorePatterns');
}

/**
 * Reads the collectCoverageFrom array from jest.config.js.
 * Returns an empty array when the config cannot be read or parsed.
 */
export function readCollectCoverageFrom(rootPath: string): string[] {
  return readJestConfigArray(rootPath, 'collectCoverageFrom');
}
