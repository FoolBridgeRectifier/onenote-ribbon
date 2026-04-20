'use strict';

const fs = require('fs');
const path = require('path');

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

const { walkDirectory } = require('./discoverContext.cjs');

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
