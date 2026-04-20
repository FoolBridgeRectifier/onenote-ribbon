'use strict';

const fs = require('fs');

// Spy on fs methods so tests control filesystem behaviour without babel hoisting.
// CJS test files are not transformed by babel-jest, so jest.mock() cannot be hoisted.
// jest.spyOn works because fs is a singleton shared between the test and source module.
let readdirSyncSpy;
let statSyncSpy;
let readFileSyncSpy;

beforeEach(() => {
  readdirSyncSpy = jest.spyOn(fs, 'readdirSync');
  statSyncSpy = jest.spyOn(fs, 'statSync');
  readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
});

afterEach(() => {
  jest.restoreAllMocks();
});

const {
  discoverAllAgentNames,
  discoverMcpServerNames,
  GLOBAL_AGENTS_FILE_EXCLUSIONS,
} = require('./discoverContext.cjs');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStat(isDirectory) {
  return { isDirectory: () => isDirectory };
}

// ---------------------------------------------------------------------------
// discoverAllAgentNames
// ---------------------------------------------------------------------------

describe('discoverAllAgentNames', () => {
  beforeEach(() => jest.clearAllMocks());

  test('merges and deduplicates plugin cache and global agent names', () => {
    // Plugin cache walk: returns 'shared-agent' from plugin
    fs.readdirSync.mockReturnValueOnce(['plugin']);
    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockReturnValueOnce(['agents']);
    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockReturnValueOnce(['shared-agent.md']);
    fs.readFileSync.mockReturnValueOnce('No frontmatter');

    // Global agents walk: returns 'shared-agent' again + 'global-only-agent'
    fs.readdirSync.mockReturnValueOnce(['cat']);
    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockReturnValueOnce(['shared-agent.md', 'global-only-agent.md']);

    const result = discoverAllAgentNames();
    expect(result).toEqual(['global-only-agent', 'shared-agent']);
  });
});

// ---------------------------------------------------------------------------
// discoverMcpServerNames
// ---------------------------------------------------------------------------

describe('discoverMcpServerNames', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns sorted server names from valid mcp.json', () => {
    fs.readFileSync.mockReturnValueOnce(JSON.stringify({
      servers: {
        playwright: {},
        skills: {},
        'chrome-devtools': {},
      },
    }));

    const result = discoverMcpServerNames();
    expect(result).toEqual(['chrome-devtools', 'playwright', 'skills']);
  });

  test('returns empty array when servers key is missing', () => {
    fs.readFileSync.mockReturnValueOnce(JSON.stringify({}));

    const result = discoverMcpServerNames();
    expect(result).toEqual([]);
  });

  test('returns empty array when file is not found', () => {
    fs.readFileSync.mockImplementationOnce(() => { throw new Error('ENOENT'); });

    const result = discoverMcpServerNames();
    expect(result).toEqual([]);
  });

  test('returns empty array when file contains invalid JSON', () => {
    fs.readFileSync.mockReturnValueOnce('not valid json {{');

    const result = discoverMcpServerNames();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// GLOBAL_AGENTS_FILE_EXCLUSIONS sanity check
// ---------------------------------------------------------------------------

describe('GLOBAL_AGENTS_FILE_EXCLUSIONS', () => {
  test('contains the expected meta file names', () => {
    expect(GLOBAL_AGENTS_FILE_EXCLUSIONS.has('README')).toBe(true);
    expect(GLOBAL_AGENTS_FILE_EXCLUSIONS.has('CONTRIBUTING')).toBe(true);
    expect(GLOBAL_AGENTS_FILE_EXCLUSIONS.has('QUICKSTART')).toBe(true);
    expect(GLOBAL_AGENTS_FILE_EXCLUSIONS.has('PULL_REQUEST_TEMPLATE')).toBe(true);
    expect(GLOBAL_AGENTS_FILE_EXCLUSIONS.has('EXECUTIVE-BRIEF')).toBe(true);
  });
});
