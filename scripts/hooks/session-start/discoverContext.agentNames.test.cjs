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
  discoverPluginCacheAgentNames,
  discoverGlobalAgentNames,
} = require('./discoverContext.cjs');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStat(isDirectory) {
  return { isDirectory: () => isDirectory };
}

// ---------------------------------------------------------------------------
// discoverPluginCacheAgentNames
// ---------------------------------------------------------------------------

describe('discoverPluginCacheAgentNames', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns agent name from frontmatter', () => {
    // plugin cache root contains one folder, which contains an agents/ folder
    fs.readdirSync.mockReturnValueOnce(['my-plugin']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['agents']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['my-agent.md']);
    fs.readFileSync.mockReturnValueOnce('---\nname: my-agent\n---\nContent');

    const result = discoverPluginCacheAgentNames();
    expect(result).toContain('my-agent');
  });

  test('falls back to file name without extension when no frontmatter name', () => {
    fs.readdirSync.mockReturnValueOnce(['my-plugin']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['agents']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['fallback-agent.md']);
    fs.readFileSync.mockReturnValueOnce('No frontmatter');

    const result = discoverPluginCacheAgentNames();
    expect(result).toContain('fallback-agent');
  });

  test('ignores non-.md files inside agents/ folder', () => {
    fs.readdirSync.mockReturnValueOnce(['my-plugin']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['agents']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['notes.txt', 'README']);

    const result = discoverPluginCacheAgentNames();
    expect(result).toEqual([]);
  });

  test('returns empty array when plugin cache is unreadable', () => {
    fs.readdirSync.mockImplementationOnce(() => { throw new Error('ENOENT'); });

    const result = discoverPluginCacheAgentNames();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// discoverGlobalAgentNames
// ---------------------------------------------------------------------------

describe('discoverGlobalAgentNames', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns agent names from category subfolders', () => {
    fs.readdirSync.mockReturnValueOnce(['engineering']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['engineering-backend-architect.md']);

    const result = discoverGlobalAgentNames();
    expect(result).toEqual(['engineering-backend-architect']);
  });

  test('excludes known non-agent meta file names', () => {
    fs.readdirSync.mockReturnValueOnce(['examples']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    // README.md and CONTRIBUTING.md should be filtered
    fs.readdirSync.mockReturnValueOnce(['README.md', 'CONTRIBUTING.md', 'real-agent.md']);

    const result = discoverGlobalAgentNames();
    expect(result).toEqual(['real-agent']);
    expect(result).not.toContain('README');
    expect(result).not.toContain('CONTRIBUTING');
  });

  test('skips non-directory entries at root level', () => {
    fs.readdirSync.mockReturnValueOnce(['README.md']);
    fs.statSync.mockReturnValueOnce(makeStat(false));

    const result = discoverGlobalAgentNames();
    expect(result).toEqual([]);
  });

  test('returns empty array when global agents dir is unreadable', () => {
    fs.readdirSync.mockImplementationOnce(() => { throw new Error('ENOENT'); });

    const result = discoverGlobalAgentNames();
    expect(result).toEqual([]);
  });

  test('silently skips category folder when readdirSync throws for it', () => {
    fs.readdirSync.mockReturnValueOnce(['broken-category']);
    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockImplementationOnce(() => { throw new Error('EACCES'); });

    const result = discoverGlobalAgentNames();
    expect(result).toEqual([]);
  });

  test('deduplicates and sorts across categories', () => {
    fs.readdirSync.mockReturnValueOnce(['z-cat', 'a-cat']);
    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockReturnValueOnce(['z-agent.md']);

    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockReturnValueOnce(['a-agent.md']);

    const result = discoverGlobalAgentNames();
    expect(result).toEqual(['a-agent', 'z-agent']);
  });
});
