'use strict';

const fs = require('fs');
const path = require('path');

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
  walkDirectory,
  discoverSkillNames,
  discoverPluginCacheAgentNames,
  discoverGlobalAgentNames,
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
// walkDirectory
// ---------------------------------------------------------------------------

describe('walkDirectory', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls visitor for each file found', () => {
    fs.readdirSync.mockReturnValueOnce(['fileA.txt', 'fileB.txt']);
    fs.statSync.mockReturnValue(makeStat(false));

    const visitor = jest.fn();
    walkDirectory('/root', 0, visitor);

    expect(visitor).toHaveBeenCalledTimes(2);
    expect(visitor).toHaveBeenCalledWith(path.join('/root', 'fileA.txt'), 'fileA.txt');
    expect(visitor).toHaveBeenCalledWith(path.join('/root', 'fileB.txt'), 'fileB.txt');
  });

  test('recurses into subdirectories up to maxDepth', () => {
    // depth 0: one directory "sub"
    fs.readdirSync.mockReturnValueOnce(['sub']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    // depth 1: one file inside "sub"
    fs.readdirSync.mockReturnValueOnce(['leaf.txt']);
    fs.statSync.mockReturnValueOnce(makeStat(false));

    const visitor = jest.fn();
    walkDirectory('/root', 1, visitor);

    expect(visitor).toHaveBeenCalledWith(path.join('/root', 'sub', 'leaf.txt'), 'leaf.txt');
  });

  test('does not recurse beyond maxDepth', () => {
    fs.readdirSync.mockReturnValueOnce(['sub']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    const visitor = jest.fn();
    // maxDepth 0 means we list /root but do not descend into sub
    walkDirectory('/root', 0, visitor);

    // visitor never called because the only entry is a directory and we don't go deeper
    expect(visitor).not.toHaveBeenCalled();
  });

  test('silently skips entries where readdirSync throws', () => {
    fs.readdirSync.mockImplementationOnce(() => { throw new Error('EACCES'); });

    const visitor = jest.fn();
    expect(() => walkDirectory('/root', 1, visitor)).not.toThrow();
    expect(visitor).not.toHaveBeenCalled();
  });

  test('silently skips entries where statSync throws', () => {
    fs.readdirSync.mockReturnValueOnce(['bad.txt']);
    fs.statSync.mockImplementationOnce(() => { throw new Error('ENOENT'); });

    const visitor = jest.fn();
    walkDirectory('/root', 1, visitor);

    expect(visitor).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// discoverSkillNames
// ---------------------------------------------------------------------------

describe('discoverSkillNames', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns skill name from frontmatter', () => {
    fs.readdirSync.mockReturnValueOnce(['my-skill']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['SKILL.md']);
    fs.statSync.mockReturnValueOnce(makeStat(false));

    fs.readFileSync.mockReturnValueOnce('---\nname: my-skill\n---\nContent here');

    const result = discoverSkillNames();
    expect(result).toEqual(['my-skill']);
  });

  test('falls back to parent folder name when frontmatter has no name', () => {
    fs.readdirSync.mockReturnValueOnce(['fallback-skill']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['SKILL.md']);
    fs.statSync.mockReturnValueOnce(makeStat(false));

    // Frontmatter exists but no name field
    fs.readFileSync.mockReturnValueOnce('---\ndescription: something\n---\nContent');

    const result = discoverSkillNames();
    expect(result).toEqual(['fallback-skill']);
  });

  test('falls back to parent folder name when no frontmatter at all', () => {
    fs.readdirSync.mockReturnValueOnce(['bare-skill']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['SKILL.md']);
    fs.statSync.mockReturnValueOnce(makeStat(false));

    fs.readFileSync.mockReturnValueOnce('No frontmatter here at all');

    const result = discoverSkillNames();
    expect(result).toEqual(['bare-skill']);
  });

  test('ignores files that are not SKILL.md', () => {
    fs.readdirSync.mockReturnValueOnce([]);
    const result = discoverSkillNames();
    expect(result).toEqual([]);
  });

  test('silently skips unreadable SKILL.md files', () => {
    fs.readdirSync.mockReturnValueOnce(['broken-skill']);
    fs.statSync.mockReturnValueOnce(makeStat(true));

    fs.readdirSync.mockReturnValueOnce(['SKILL.md']);
    fs.statSync.mockReturnValueOnce(makeStat(false));

    fs.readFileSync.mockImplementationOnce(() => { throw new Error('EACCES'); });

    const result = discoverSkillNames();
    expect(result).toEqual([]);
  });

  test('deduplicates and sorts names', () => {
    // First skill
    fs.readdirSync.mockReturnValueOnce(['z-skill', 'a-skill']);
    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockReturnValueOnce(['SKILL.md']);
    fs.statSync.mockReturnValueOnce(makeStat(false));
    fs.readFileSync.mockReturnValueOnce('---\nname: z-skill\n---');

    fs.statSync.mockReturnValueOnce(makeStat(true));
    fs.readdirSync.mockReturnValueOnce(['SKILL.md']);
    fs.statSync.mockReturnValueOnce(makeStat(false));
    fs.readFileSync.mockReturnValueOnce('---\nname: a-skill\n---');

    const result = discoverSkillNames();
    expect(result).toEqual(['a-skill', 'z-skill']);
  });
});

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
