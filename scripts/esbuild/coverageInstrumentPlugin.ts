/**
 * Esbuild plugin for code coverage instrumentation.
 * Injects branch counters into the source code to track execution during E2E tests.
 */

import * as fs from 'fs';
import * as path from 'path';

interface CoverageInstrumentOptions {
  /** Root directory of the project */
  rootDir: string;
  /** Files to instrument (glob patterns) */
  include?: string[];
  /** Files to exclude from instrumentation */
  exclude?: string[];
}

interface InstrumentedFile {
  filePath: string;
  branchMap: Record<string, BranchInfo>;
  fnMap: Record<string, FunctionInfo>;
  statementMap: Record<string, StatementInfo>;
}

interface BranchInfo {
  line: number;
  column: number;
  type: string;
  locations: Location[];
}

interface FunctionInfo {
  name: string;
  line: number;
  column: number;
  decl: Location;
  loc: Location;
}

interface StatementInfo {
  start: Location;
  end: Location;
}

interface Location {
  line: number;
  column: number;
}

// Global coverage object name
const COVERAGE_GLOBAL = '__ONR_COVERAGE__';

// Counter for unique IDs
let branchCounter = 0;
let functionCounter = 0;
let statementCounter = 0;

/**
 * Creates the esbuild plugin for coverage instrumentation.
 */
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

/**
 * Check if a file should be skipped from instrumentation.
 */
function shouldSkipFile(
  filePath: string,
  options: CoverageInstrumentOptions,
): boolean {
  // Skip node_modules and test files
  if (filePath.includes('node_modules')) return true;
  if (filePath.includes('.test.')) return true;
  if (filePath.includes('__mocks__')) return true;
  if (filePath.includes('test-utils')) return true;
  if (filePath.includes('e2e/')) return true;

  // Skip based on exclude patterns
  if (options.exclude) {
    for (const pattern of options.exclude) {
      if (filePath.includes(pattern)) return true;
    }
  }

  // Check include patterns if specified
  if (options.include) {
    return !options.include.some((pattern) => filePath.includes(pattern));
  }

  return false;
}

/**
 * Create the global coverage initialization code.
 */
function createCoverageGlobalInit(): string {
  return `
if (typeof globalThis !== 'undefined' && !globalThis.${COVERAGE_GLOBAL}) {
  globalThis.${COVERAGE_GLOBAL} = {};
}
if (typeof window !== 'undefined' && !window.${COVERAGE_GLOBAL}) {
  window.${COVERAGE_GLOBAL} = {};
}
export {};
`;
}

interface InstrumentResult {
  code: string;
  branchMap: Record<string, BranchInfo>;
  fnMap: Record<string, FunctionInfo>;
  statementMap: Record<string, StatementInfo>;
}

/**
 * Instrument source code with coverage counters.
 * This is a simplified instrumentation that tracks:
 * - Function entry points
 * - Conditional branches (if, ternary, logical operators)
 * - Switch cases
 */
function instrumentSource(source: string, filePath: string): InstrumentResult {
  const branchMap: Record<string, BranchInfo> = {};
  const fnMap: Record<string, FunctionInfo> = {};
  const statementMap: Record<string, StatementInfo> = {};

  let instrumentedCode = source;

  // Reset counters for this file
  branchCounter = 0;
  functionCounter = 0;
  statementCounter = 0;

  // Get file ID for coverage tracking
  const fileId = filePath.replace(/[^a-zA-Z0-9]/g, '_');

  // Inject coverage initialization at the start of the file
  const coverageInit = `
const __coverage_${fileId} = (typeof globalThis !== 'undefined' ? globalThis : window).${COVERAGE_GLOBAL}['${filePath}'] = (typeof globalThis !== 'undefined' ? globalThis : window).${COVERAGE_GLOBAL}['${filePath}'] || { s: {}, b: {}, f: {} };
`;

  // Pattern-based instrumentation for common branch types
  // Note: This is a simplified approach. For production, consider using
  // a proper AST-based tool like istanbul-lib-instrument

  // Instrument function declarations
  instrumentedCode = instrumentFunctions(
    instrumentedCode,
    fileId,
    filePath,
    fnMap,
  );

  // Instrument if statements
  instrumentedCode = instrumentIfStatements(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  // Instrument ternary operators
  instrumentedCode = instrumentTernaryOperators(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  // Instrument logical operators (&&, ||)
  instrumentedCode = instrumentLogicalOperators(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  // Instrument switch statements
  instrumentedCode = instrumentSwitchStatements(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  return {
    code: coverageInit + instrumentedCode,
    branchMap,
    fnMap,
    statementMap,
  };
}

/**
 * Instrument function declarations and expressions.
 */
function instrumentFunctions(
  code: string,
  fileId: string,
  filePath: string,
  fnMap: Record<string, FunctionInfo>,
): string {
  // Pattern for function declarations: function name(...) { ... }
  const functionDeclarationPattern =
    /function\s+(\w+)\s*\([^)]*\)\s*\{/g;

  // Pattern for arrow functions: const name = (...) => { ... }
  const arrowFunctionPattern =
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>\s*\{/g;

  // Pattern for method definitions: methodName(...) { ... }
  const methodPattern = /(\w+)\s*\([^)]*\)\s*\{/g;

  let result = code;
  let match;

  // Instrument function declarations
  while ((match = functionDeclarationPattern.exec(code)) !== null) {
    const functionName = match[1];
    const functionId = ++functionCounter;

    fnMap[functionId] = {
      name: functionName,
      line: getLineNumber(code, match.index),
      column: getColumnNumber(code, match.index),
      decl: { line: getLineNumber(code, match.index), column: 0 },
      loc: { line: getLineNumber(code, match.index), column: 0 },
    };

    // Insert coverage counter after opening brace
    const insertPos = match.index + match[0].length;
    const counterCode = `__coverage_${fileId}.f[${functionId}] = (__coverage_${fileId}.f[${functionId}] || 0) + 1; `;

    result =
      result.slice(0, insertPos) + counterCode + result.slice(insertPos);
  }

  return result;
}

/**
 * Instrument if statements.
 */
function instrumentIfStatements(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for if statements: if (condition) { ... }
  const ifPattern = /if\s*\(([^)]+)\)\s*\{/g;

  let result = code;
  let match;
  const matches: Array<{ index: number; length: number; condition: string }> =
    [];

  // Collect all matches first
  while ((match = ifPattern.exec(code)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      condition: match[1],
    });
  }

  // Process from end to start to preserve indices
  for (let index = matches.length - 1; index >= 0; index--) {
    const matchInfo = matches[index];
    const branchId = ++branchCounter;

    branchMap[branchId] = {
      line: getLineNumber(code, matchInfo.index),
      column: getColumnNumber(code, matchInfo.index),
      type: 'if',
      locations: [
        { line: getLineNumber(code, matchInfo.index), column: 0 },
        { line: getLineNumber(code, matchInfo.index), column: 0 },
      ],
    };

    // Insert branch counters
    const insertPos = matchInfo.index + matchInfo.length;
    const trueCounter = `__coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0, 0]; __coverage_${fileId}.b[${branchId}][0]++; `;

    result =
      result.slice(0, insertPos) + trueCounter + result.slice(insertPos);
  }

  return result;
}

/**
 * Instrument ternary operators.
 */
function instrumentTernaryOperators(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for ternary: condition ? trueExpr : falseExpr
  // This is complex - we wrap the entire ternary in a function
  const ternaryPattern = /(\w+)\s*\?\s*([^:]+)\s*:\s*([^;\n,]+)/g;

  let result = code;
  let match;

  while ((match = ternaryPattern.exec(code)) !== null) {
    const branchId = ++branchCounter;

    branchMap[branchId] = {
      line: getLineNumber(code, match.index),
      column: getColumnNumber(code, match.index),
      type: 'cond-expr',
      locations: [
        { line: getLineNumber(code, match.index), column: 0 },
        { line: getLineNumber(code, match.index), column: 0 },
      ],
    };

    // Replace with instrumented version
    const condition = match[1];
    const trueExpr = match[2];
    const falseExpr = match[3];

    const instrumented = `((__cov_${branchId} = ${condition}) ? (__coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0, 0], __coverage_${fileId}.b[${branchId}][0]++, ${trueExpr}) : (__coverage_${fileId}.b[${branchId}][1]++, ${falseExpr}))`;

    result =
      result.slice(0, match.index) +
      instrumented +
      result.slice(match.index + match[0].length);
  }

  return result;
}

/**
 * Instrument logical operators (&&, ||).
 */
function instrumentLogicalOperators(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for logical AND: expr1 && expr2
  const andPattern = /(\w+)\s*&&\s*(\w+)/g;

  let result = code;
  let match;

  while ((match = andPattern.exec(code)) !== null) {
    const branchId = ++branchCounter;

    branchMap[branchId] = {
      line: getLineNumber(code, match.index),
      column: getColumnNumber(code, match.index),
      type: 'binary-expr',
      locations: [
        { line: getLineNumber(code, match.index), column: 0 },
        { line: getLineNumber(code, match.index), column: 0 },
      ],
    };

    // Wrap with instrumentation
    const left = match[1];
    const right = match[2];

    const instrumented = `((__cov_${branchId} = ${left}) ? (__coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0, 0], __coverage_${fileId}.b[${branchId}][0]++, ${right}) : (__coverage_${fileId}.b[${branchId}][1]++, __cov_${branchId}))`;

    result =
      result.slice(0, match.index) +
      instrumented +
      result.slice(match.index + match[0].length);
  }

  return result;
}

/**
 * Instrument switch statements.
 */
function instrumentSwitchStatements(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for case statements: case value:
  const casePattern = /case\s+[^:]+:/g;

  let result = code;
  let match;
  const matches: Array<{ index: number; length: number }> = [];

  while ((match = casePattern.exec(code)) !== null) {
    matches.push({ index: match.index, length: match[0].length });
  }

  // Process from end to start
  for (let index = matches.length - 1; index >= 0; index--) {
    const matchInfo = matches[index];
    const branchId = ++branchCounter;

    branchMap[branchId] = {
      line: getLineNumber(code, matchInfo.index),
      column: getColumnNumber(code, matchInfo.index),
      type: 'switch',
      locations: [
        { line: getLineNumber(code, matchInfo.index), column: 0 },
      ],
    };

    // Insert counter after case label
    const insertPos = matchInfo.index + matchInfo.length;
    const counterCode = ` __coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0]; __coverage_${fileId}.b[${branchId}][0]++; `;

    result =
      result.slice(0, insertPos) + counterCode + result.slice(insertPos);
  }

  return result;
}

/**
 * Get line number from character index.
 */
function getLineNumber(code: string, index: number): number {
  return code.slice(0, index).split('\n').length;
}

/**
 * Get column number from character index.
 */
function getColumnNumber(code: string, index: number): number {
  const lines = code.slice(0, index).split('\n');
  return lines[lines.length - 1].length;
}
