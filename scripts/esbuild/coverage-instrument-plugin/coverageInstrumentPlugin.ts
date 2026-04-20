import * as path from 'path';

import type { OnLoadArgs, OnLoadResult, Plugin } from 'esbuild';
import { createInstrumenter, defaultOpts } from 'istanbul-lib-instrument';

import { COVERAGE_GLOBAL, COVERAGE_PLUGIN_NAME, SCRIPT_FILE_FILTER } from './constants';
import type { CoverageInstrumentOptions, InstrumentedFile, RawCoverageFile } from './interfaces';
import {
  getInstrumentLoader,
  shouldSkipFile,
  toInstrumentedFile,
  writeInstrumentationMetadata,
} from './helpers';

function normalizeRelativeFilePath(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

export function createCoverageInstrumentPlugin(options: CoverageInstrumentOptions): Plugin {
  const instrumentedFiles = new Map<string, InstrumentedFile>();
  const instrumenter = createInstrumenter({
    coverageVariable: COVERAGE_GLOBAL,
    esModules: true,
    produceSourceMap: false,
    compact: false,
    preserveComments: true,
    // Istanbul defaults omit the syntax plugins needed for raw TS and TSX source files.
    parserPlugins: [...defaultOpts.parserPlugins, 'jsx', 'typescript'],
  });

  const loadInstrumentedFile = async (args: OnLoadArgs): Promise<OnLoadResult | null> => {
    if (shouldSkipFile(args.path, options)) {
      return null;
    }

    const sourceText = await fs.promises.readFile(args.path, 'utf8');
    const relativeFilePath = normalizeRelativeFilePath(options.rootDir, args.path);
    const instrumentedCode = instrumenter.instrumentSync(sourceText, relativeFilePath);

    // Istanbul exposes the metadata for the most recently instrumented file via internal state.
    const latestCoverage = instrumenter.lastFileCoverage() as RawCoverageFile | null;

    if (latestCoverage) {
      instrumentedFiles.set(relativeFilePath, toInstrumentedFile(relativeFilePath, latestCoverage));
    }

    return {
      contents: instrumentedCode,
      loader: getInstrumentLoader(args.path),
    };
  };

  return {
    name: COVERAGE_PLUGIN_NAME,
    setup(build) {
      build.onLoad({ filter: SCRIPT_FILE_FILTER }, loadInstrumentedFile);
      build.onEnd(() => {
        writeInstrumentationMetadata(options.rootDir, instrumentedFiles);
      });
    },
  };
}
