'use strict';

/**
 * Calculate statement (or function) coverage percentage from an Istanbul
 * hit-count map where each value is the number of times that statement was
 * executed.  Returns 100 when the map is empty (nothing to cover).
 * @param {Record<string, number>} hitCounts
 * @returns {number}
 */
function statementPercent(hitCounts) {
  const values = Object.values(hitCounts);
  if (values.length === 0) return 100;
  const covered = values.filter((count) => count > 0).length;
  return (covered / values.length) * 100;
}

/**
 * Calculate branch coverage percentage from an Istanbul branch hit-count map.
 * Each entry is an array of hit counts — one per fork (then / else / case …).
 * Returns 100 when there are no branches.
 * @param {Record<string, number[]>} branchHitCounts
 * @returns {number}
 */
function branchPercent(branchHitCounts) {
  // Flatten all fork counts into a single array
  const forks = Object.values(branchHitCounts).flat();
  if (forks.length === 0) return 100;
  const covered = forks.filter((count) => count > 0).length;
  return (covered / forks.length) * 100;
}

/**
 * Calculate line coverage percentage from Istanbul's statementMap and
 * per-statement hit counts.  Collapses multiple statements on the same line
 * into a single line entry — a line is covered when at least one statement on
 * it was executed.  Returns 100 when the map is empty.
 * @param {Record<string, { start: { line: number } }>} statementMap
 * @param {Record<string, number>} statementHits
 * @returns {number}
 */
function linePercent(statementMap, statementHits) {
  const coveredLines = new Set();
  const totalLines = new Set();

  for (const [statementKey, location] of Object.entries(statementMap)) {
    const lineNumber = location.start.line;
    totalLines.add(lineNumber);

    if ((statementHits[statementKey] ?? 0) > 0) {
      coveredLines.add(lineNumber);
    }
  }

  if (totalLines.size === 0) return 100;
  return (coveredLines.size / totalLines.size) * 100;
}

/**
 * Returns a short project-relative display path for console output.
 * Strips the rootDir prefix and leading path separator when present.
 * @param {string} absolutePath
 * @param {string} rootDir
 * @returns {string}
 */
function displayPath(absolutePath, rootDir) {
  return absolutePath.startsWith(rootDir)
    ? absolutePath.slice(rootDir.length).replace(/^[\\/]/, '')
    : absolutePath;
}

module.exports = { statementPercent, branchPercent, linePercent, displayPath };
