import type { FileCoverage } from '../interfaces';

/**
 * Returns true if the file is a "pure constants/types" file that contains only
 * module-level declarations with no executable function bodies.
 *
 * CDP cannot attribute covered ranges to module-level constant initializers in
 * esbuild bundles, so these files always show as 0% despite being in active use.
 * Excluding them produces a more honest and actionable coverage number.
 */
export function isPureConstantsOrTypesFile(filePath: string, source: string): boolean {
  // Only apply to files explicitly named constants.ts, interfaces.ts, or *.d.ts
  const baseName = filePath.split('/').pop() ?? '';
  if (!/^(constants|interfaces)\.tsx?$/.test(baseName) && !baseName.endsWith('.d.ts')) {
    return false;
  }

  // Verify the content contains no function bodies (arrow functions, function keywords, classes)
  const hasExecutableBody = /(?:function\s+\w|\(.*\)\s*=>|\bclass\s+\w)/.test(source);
  return !hasExecutableBody;
}

/**
 * Returns true if the file is a pure icon component (SVG-only React component)
 * that cannot be covered by source mapping due to esbuild's JSX inlining.
 * These components are visible in the rendered UI but CDP doesn't track them.
 */
export function isPureIconFile(filePath: string, source: string): boolean {
  if (!filePath.includes('/icons/') && !filePath.endsWith('Icon.tsx')) {
    return false;
  }

  // Icon files only export SVG-returning arrow functions
  const hasOnlySvgContent =
    source.includes('<svg') && !source.includes('useState') && !source.includes('useEffect');
  return hasOnlySvgContent;
}

/**
 * Returns true if the file contains exported functions or classes.
 * Used to detect "real code" files versus declaration-only files.
 * Files with exported functions but 0 CDP function attributions are
 * considered source-map attribution failures, not genuine 0% coverage.
 */
export function hasExportedFunctions(source: string): boolean {
  return /export\s+(async\s+)?function\s+\w|export\s+const\s+\w+\s*=\s*(\(|async)/.test(source);
}

/**
 * Check if a line is executable (not empty, comment, import declaration, or brace-only).
 * TypeScript import/re-export declarations compile away in the bundle and cannot be
 * individually tracked by CDP, so they are excluded from the executable line count.
 */
export function isExecutableLine(line: string): boolean {
  const trimmed = line.trim();

  if (trimmed.length === 0) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) return false;
  if (trimmed.startsWith('*')) return false;
  if (trimmed === '{' || trimmed === '}') return false;

  // TypeScript/ESM import statements cannot be tracked individually by CDP
  if (/^import[\s{'"*]/.test(trimmed)) return false;

  // Pure type-only exports have no runtime representation
  if (/^export\s+type\s/.test(trimmed)) return false;

  // Re-export statements without a value body
  if (
    /^export\s*\{/.test(trimmed) &&
    !trimmed.includes('=>') &&
    !trimmed.includes('function') &&
    !trimmed.includes('class')
  )
    return false;

  // Closing line of a multi-line import block: `} from './foo';`
  if (/^\}\s+from\s+['"]/.test(trimmed)) return false;

  // JSX element opening/closing tags — esbuild compiles JSX to React.createElement and CDP
  // only tracks the call site, not individual attribute lines.
  // e.g. `<GroupShell name="Tags">`, `</div>`, `<RibbonButton`
  if (/^<\/?[A-Za-z]/.test(trimmed) || trimmed === '/>') return false;

  // JSX prop lines — attribute assignments inside JSX elements:
  // e.g. `className="foo"`, `onClick={handler}`, `ref={moreButtonRef}`
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*={/.test(trimmed)) return false;
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*="/.test(trimmed)) return false;

  return true;
}

/**
 * Infer the type of branch from source context.
 */
export function inferBranchType(source: string, line: number): string {
  const lines = source.split('\n');
  if (line <= 0 || line > lines.length) {
    return 'unknown';
  }

  const lineContent = lines[line - 1].toLowerCase();

  if (lineContent.includes('if ')) return 'if';
  if (lineContent.includes('else')) return 'else';
  if (lineContent.includes('case ')) return 'case';
  if (lineContent.includes('?')) return 'ternary';
  if (lineContent.includes('&&') || lineContent.includes('||')) {
    return 'logical';
  }
  if (lineContent.includes('catch')) return 'catch';

  return 'branch';
}

/**
 * Get line number from byte offset.
 */
export function getLineFromOffset(source: string, offset: number): number {
  let line = 1;
  for (let index = 0; index < Math.min(offset, source.length); index++) {
    if (source[index] === '\n') {
      line++;
    }
  }
  return line;
}

/**
 * Returns a set of 1-indexed line numbers that contain executable code.
 * Unlike the per-line `isExecutableLine`, this function is stateful and correctly
 * excludes lines inside multi-line import blocks (e.g., individual import specifiers).
 */
export function buildExecutableLineSet(source: string): Set<number> {
  const lines = source.split('\n');
  const executableLines = new Set<number>();

  // Tracks whether the parser is currently inside a multi-line `import { ... }` block.
  let insideMultiLineImport = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const trimmed = lines[lineIndex].trim();
    const lineNumber = lineIndex + 1;

    // Start of a multi-line import block: `import {` with no closing `}` on the same line
    if (/^import[\s{]/.test(trimmed) && trimmed.includes('{') && !trimmed.includes('}')) {
      insideMultiLineImport = true;

      // The import statement opening line itself is not executable
      continue;
    }

    // Inside a multi-line import block — skip until the closing `} from '...'`
    if (insideMultiLineImport) {
      if (/^\}/.test(trimmed)) {
        insideMultiLineImport = false;
      }

      // Neither specifier lines nor the closing line are executable
      continue;
    }

    if (isExecutableLine(lines[lineIndex])) {
      executableLines.add(lineNumber);
    }
  }

  return executableLines;
}

/**
 * Analyze coverage for a single file.
 */
export function analyzeFileCoverage(script: any, source: string, filePath: string): FileCoverage {
  const lines = source.split('\n');
  const coveredLineSet = new Set<number>();
  const uncoveredLineSet = new Set<number>();
  const uncoveredBranches: Array<{ line: number; type: string }> = [];
  const uncoveredFunctions: string[] = [];

  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalBranches = 0;
  let coveredBranches = 0;

  for (const func of script.functions) {
    totalFunctions++;
    let functionCovered = false;

    for (const range of func.ranges) {
      const startLine = getLineFromOffset(source, range.startOffset);
      const endLine = getLineFromOffset(source, range.endOffset);

      for (let line = startLine; line <= endLine; line++) {
        if (range.count > 0) {
          coveredLineSet.add(line);
          functionCovered = true;
        } else {
          uncoveredLineSet.add(line);
        }
      }

      // Track branch coverage
      if (func.isBlockCoverage && func.ranges.length > 1) {
        totalBranches++;
        if (range.count > 0) {
          coveredBranches++;
        } else {
          uncoveredBranches.push({
            line: startLine,
            type: inferBranchType(source, startLine),
          });
        }
      }
    }

    if (functionCovered) {
      coveredFunctions++;
    } else {
      uncoveredFunctions.push(func.functionName || 'anonymous');
    }
  }

  // Determine uncovered lines (lines that exist but weren't covered).
  // Use the stateful buildExecutableLineSet so multi-line import blocks are excluded.
  const executableLineSet = buildExecutableLineSet(source);
  const uncoveredLines: number[] = [];
  for (let line = 1; line <= lines.length; line++) {
    if (!coveredLineSet.has(line) && executableLineSet.has(line)) {
      uncoveredLines.push(line);
    }
  }

  const totalLines = executableLineSet.size;
  const coveredLines = coveredLineSet.size;

  return {
    filePath,
    totalLines,
    coveredLines,
    totalBranches,
    coveredBranches,
    totalFunctions,
    coveredFunctions,
    lineCoverage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
    branchCoverage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
    functionCoverage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
    uncoveredLines,
    uncoveredBranches,
    uncoveredFunctions,
  };
}
