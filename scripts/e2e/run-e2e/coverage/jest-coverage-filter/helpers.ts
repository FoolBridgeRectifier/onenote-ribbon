import * as fs from 'fs';
import * as path from 'path';

import { JEST_CONFIG_FILENAME } from './constants';

/**
 * Reads a named top-level array property from jest.config.js by parsing the file
 * as text.  Compatible with both CJS and ESM host contexts.
 * Returns an empty array when the config cannot be read or the property is absent.
 */
export function readJestConfigArray(rootPath: string, propertyName: string): string[] {
  const jestConfigPath = path.join(rootPath, JEST_CONFIG_FILENAME);

  if (!fs.existsSync(jestConfigPath)) {
    return [];
  }

  try {
    const configText = fs.readFileSync(jestConfigPath, 'utf8');

    // Build the regex dynamically to match the named array property
    const propertyPattern = new RegExp(`${propertyName}\\s*:\\s*\\[([\\s\\S]*?)\\]`);
    const arrayBodyMatch = configText.match(propertyPattern);

    if (!arrayBodyMatch) {
      return [];
    }

    const quotedEntries = arrayBodyMatch[1].match(/["']([^"']+)["']/g);
    if (!quotedEntries) {
      return [];
    }

    return quotedEntries.map((entry) => entry.slice(1, -1));
  } catch {
    return [];
  }
}
