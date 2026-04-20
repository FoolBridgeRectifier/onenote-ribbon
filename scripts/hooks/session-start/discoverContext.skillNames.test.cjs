'use strict';

const fs = require('fs');

// Spy on fs methods so tests control filesystem behaviour without babel hoisting.
// CJS test files are not transformed by babel-jest, so jest.mock() cannot be hoisted.
// jest.spyOn works because fs is a singleton shared between the test and source module.
beforeEach(() => {
  jest.spyOn(fs, 'readdirSync');
  jest.spyOn(fs, 'statSync');
  jest.spyOn(fs, 'readFileSync');
});

afterEach(() => {
  jest.restoreAllMocks();
});

const { discoverSkillNames } = require('./discoverContext.cjs');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStat(isDirectory) {
  return { isDirectory: () => isDirectory };
}

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
