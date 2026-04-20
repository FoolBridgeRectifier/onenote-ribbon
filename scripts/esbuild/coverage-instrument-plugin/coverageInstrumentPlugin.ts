import * as fs from 'fs';
import * as path from 'path';

import type { CoverageInstrumentOptions, InstrumentedFile } from './interfaces';
import {
  shouldSkipFile,
  createCoverageGlobalInit,
  instrumentSource,
} from './helpers';

/** Creates the esbuild plugin for coverage instrumentation. */
export function createCoverageInstrumentPlugin(
  options: CoverageInstrumentOptions,
) {
  const instrumentedFiles: Map<string, InstrumentedFile> = new Map();

  return {
    name: 'coverage-instrument',
    setup(build: any) {
      // Inject coverage initialization at the start of the bundle
      build.onResolve({ filter: /.*/ }, (args: any) => {
        if (args.path === 'coverage-inject') {
          return { path: args.path, namespace: 'coverage-inject' };
        }
        return null;
      });

      build.onLoad({ filter: /.*/, namespace: 'coverage-inject' }, () => {
        return {
          contents: createCoverageGlobalInit(),
          loader: 'js',
        };
      });

      // Instrument TypeScript/JavaScript files
      build.onLoad({ filter: /\.(ts|tsx|js|jsx)$/ }, async (args: any) => {
        // Skip files that shouldn't be instrumented
        if (shouldSkipFile(args.path, options)) {
          return null;
        }

        const source = await fs.promises.readFile(args.path, 'utf8');
        const relativePath = path.relative(options.rootDir, args.path);

        // Simple instrumentation - inject counters for branches
        const instrumented = instrumentSource(source, relativePath);

        // Store metadata for coverage reporting
        instrumentedFiles.set(relativePath, {
          filePath: relativePath,
          branchMap: instrumented.branchMap,
          fnMap: instrumented.fnMap,
          statementMap: instrumented.statementMap,
        });

        return {
          contents: instrumented.code,
          loader: args.path.endsWith('.tsx') || args.path.endsWith('.jsx')
            ? 'tsx'
            : 'ts',
        };
      });

      // Write coverage metadata after build
      build.onEnd(() => {
        const coverageDir = path.join(options.rootDir, '.coverage-meta');
        if (!fs.existsSync(coverageDir)) {
          fs.mkdirSync(coverageDir, { recursive: true });
        }

        const metadata: Record<string, InstrumentedFile> = {};
        instrumentedFiles.forEach((value, key) => {
          metadata[key] = value;
        });

        fs.writeFileSync(
          path.join(coverageDir, 'instrumentation.json'),
          JSON.stringify(metadata, null, 2),
        );
      });
    },
  };
}
import * as fs from 'fs';
import * as path from 'path';

import type { OnLoadArgs, OnLoadResult, Plugin } from 'esbuild';
import { createInstrumenter, defaultOpts } from 'istanbul-lib-instrument';

import {
  COVERAGE_GLOBAL,
  COVERAGE_PLUGIN_NAME,
  SCRIPT_FILE_FILTER,
} from './constants';
import type {
  CoverageInstrumentOptions,
  InstrumentedFile,
  RawCoverageFile,
} from './interfaces';
import {
  getInstrumentLoader,
  shouldSkipFile,
  toInstrumentedFile,
  writeInstrumentationMetadata,
} from './helpers';

function normalizeRelativeFilePath(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

export function createCoverageInstrumentPlugin(
  options: CoverageInstrumentOptions,
): Plugin {
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

  const loadInstrumentedFile = async (
    args: OnLoadArgs,
  ): Promise<OnLoadResult | null> => {
    if (shouldSkipFile(args.path, options)) {
      return null;
    }

    const sourceText = await fs.promises.readFile(args.path, 'utf8');
    const relativeFilePath = normalizeRelativeFilePath(options.rootDir, args.path);
    const instrumentedCode = instrumenter.instrumentSync(
      sourceText,
      relativeFilePath,
    );

    // Istanbul exposes the metadata for the most recently instrumented file via internal state.
    const latestCoverage = instrumenter.lastFileCoverage() as RawCoverageFile | null;

    if (latestCoverage) {
      instrumentedFiles.set(
        relativeFilePath,
        toInstrumentedFile(relativeFilePath, latestCoverage),
      );
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