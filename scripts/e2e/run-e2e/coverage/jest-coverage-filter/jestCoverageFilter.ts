import * as fs from 'fs';
import * as path from 'path';

import { JEST_CONFIG_FILENAME } from './constants';

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
 *
 * If patterns is empty every file is accepted (no config available).
 */
export function shouldIncludeSourceFile(
  normalizedPath: string,
  collectCoverageFromPatterns: string[]
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

  return !isExcluded;
}

/**
 * Reads the collectCoverageFrom array from jest.config.js by parsing the file
 * as text so it is compatible with both CJS and ESM contexts.
 * Returns an empty array when the config cannot be read or parsed.
 */
export function readCollectCoverageFrom(rootPath: string): string[] {
  const jestConfigPath = path.join(rootPath, JEST_CONFIG_FILENAME);

  if (!fs.existsSync(jestConfigPath)) {
    return [];
  }

  try {
    const configText = fs.readFileSync(jestConfigPath, 'utf8');

    // Extract the array body between collectCoverageFrom: [ ... ]
    const arrayBodyMatch = configText.match(/collectCoverageFrom\s*:\s*\[([\s\S]*?)\]/);
    if (!arrayBodyMatch) {
      return [];
    }

    // Extract every quoted string from the array body
    const quotedEntries = arrayBodyMatch[1].match(/["']([^"']+)["']/g);
    if (!quotedEntries) {
      return [];
    }

    // Strip surrounding quotes from each matched entry
    return quotedEntries.map((entry) => entry.slice(1, -1));
  } catch {
    return [];
  }
}
