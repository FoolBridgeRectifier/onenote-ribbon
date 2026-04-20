import * as fs from 'fs';
import * as path from 'path';

import { getInstrumentLoader, toInstrumentedFile, writeInstrumentationMetadata } from '../helpers';
import type { InstrumentedFile, RawCoverageFile } from '../interfaces';

// ── getInstrumentLoader ───────────────────────────────────────────────────────

describe('getInstrumentLoader', () => {
  it('returns tsx for .tsx files', () => {
    expect(getInstrumentLoader('Component.tsx')).toBe('tsx');
  });

  it('returns jsx for .jsx files', () => {
    expect(getInstrumentLoader('Component.jsx')).toBe('jsx');
  });

  it('returns js for .js files', () => {
    expect(getInstrumentLoader('utils.js')).toBe('js');
  });

  it('returns ts for .ts files', () => {
    expect(getInstrumentLoader('helpers.ts')).toBe('ts');
  });

  it('returns ts as the fallback for unrecognised extensions', () => {
    expect(getInstrumentLoader('file.unknown')).toBe('ts');
  });

  it('returns ts for files with no extension', () => {
    expect(getInstrumentLoader('Makefile')).toBe('ts');
  });

  it('matches only the final extension, not an earlier one', () => {
    // A file like "foo.tsx.bak" should NOT match .tsx
    expect(getInstrumentLoader('Component.tsx.bak')).toBe('ts');
  });
});

// ── toInstrumentedFile ────────────────────────────────────────────────────────

describe('toInstrumentedFile', () => {
  const rawCoverage: RawCoverageFile = {
    branchMap: { '0': { type: 'if', locations: [] } },
    fnMap: {
      '0': {
        name: 'myFn',
        decl: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      },
    },
    statementMap: { '0': { start: { line: 2, column: 4 }, end: { line: 2, column: 20 } } },
  };

  it('sets filePath to the provided relativeFilePath', () => {
    const result = toInstrumentedFile('src/utils.ts', rawCoverage);
    expect(result.filePath).toBe('src/utils.ts');
  });

  it('copies branchMap from rawCoverage', () => {
    const result = toInstrumentedFile('src/utils.ts', rawCoverage);
    expect(result.branchMap).toBe(rawCoverage.branchMap);
  });

  it('copies fnMap from rawCoverage', () => {
    const result = toInstrumentedFile('src/utils.ts', rawCoverage);
    expect(result.fnMap).toBe(rawCoverage.fnMap);
  });

  it('copies statementMap from rawCoverage', () => {
    const result = toInstrumentedFile('src/utils.ts', rawCoverage);
    expect(result.statementMap).toBe(rawCoverage.statementMap);
  });

  it('handles empty maps', () => {
    const emptyCoverage: RawCoverageFile = { branchMap: {}, fnMap: {}, statementMap: {} };
    const result = toInstrumentedFile('src/empty.ts', emptyCoverage);
    expect(result).toEqual({
      filePath: 'src/empty.ts',
      branchMap: {},
      fnMap: {},
      statementMap: {},
    });
  });
});

// ── writeInstrumentationMetadata ──────────────────────────────────────────────

describe('writeInstrumentationMetadata', () => {
  let existsSyncSpy: jest.SpyInstance;
  let mkdirSyncSpy: jest.SpyInstance;
  let writeFileSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    existsSyncSpy = jest.spyOn(fs, 'existsSync');
    mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
    writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates the .coverage-meta directory when it does not exist', () => {
    existsSyncSpy.mockReturnValue(false);

    writeInstrumentationMetadata('/project', new Map());

    expect(mkdirSyncSpy).toHaveBeenCalledWith(path.join('/project', '.coverage-meta'), {
      recursive: true,
    });
  });

  it('does not create the directory when it already exists', () => {
    existsSyncSpy.mockReturnValue(true);

    writeInstrumentationMetadata('/project', new Map());

    expect(mkdirSyncSpy).not.toHaveBeenCalled();
  });

  it('writes all instrumented files as JSON to instrumentation.json', () => {
    existsSyncSpy.mockReturnValue(true);

    const instrumentedFile: InstrumentedFile = {
      filePath: 'src/utils.ts',
      branchMap: {},
      fnMap: {},
      statementMap: {},
    };
    const instrumentedFiles = new Map<string, InstrumentedFile>([
      ['src/utils.ts', instrumentedFile],
    ]);

    writeInstrumentationMetadata('/project', instrumentedFiles);

    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      path.join('/project', '.coverage-meta', 'instrumentation.json'),
      JSON.stringify({ 'src/utils.ts': instrumentedFile }, null, 2)
    );
  });

  it('writes an empty JSON object when the map is empty', () => {
    existsSyncSpy.mockReturnValue(true);

    writeInstrumentationMetadata('/project', new Map());

    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      path.join('/project', '.coverage-meta', 'instrumentation.json'),
      JSON.stringify({}, null, 2)
    );
  });

  it('writes multiple entries preserving all keys', () => {
    existsSyncSpy.mockReturnValue(true);

    const fileA: InstrumentedFile = {
      filePath: 'src/a.ts',
      branchMap: {},
      fnMap: {},
      statementMap: {},
    };
    const fileB: InstrumentedFile = {
      filePath: 'src/b.ts',
      branchMap: {},
      fnMap: {},
      statementMap: {},
    };
    const instrumentedFiles = new Map<string, InstrumentedFile>([
      ['src/a.ts', fileA],
      ['src/b.ts', fileB],
    ]);

    writeInstrumentationMetadata('/project', instrumentedFiles);

    const writtenJson = JSON.parse(writeFileSyncSpy.mock.calls[0][1] as string);
    expect(writtenJson['src/a.ts']).toEqual(fileA);
    expect(writtenJson['src/b.ts']).toEqual(fileB);
  });
});
