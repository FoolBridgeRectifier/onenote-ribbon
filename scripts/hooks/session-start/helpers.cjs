'use strict';

const fs = require('fs');
const path = require('path');

const SKILLS_PLUGIN_CACHE = 'C:/Users/Dragus/.claude/plugins/cache';
const GLOBAL_AGENTS_DIR = 'C:/Users/Dragus/.claude/agents';

// Non-agent files that appear inside category subfolders of the global agents repo
const GLOBAL_AGENTS_FILE_EXCLUSIONS = new Set([
  'CONTRIBUTING', 'EXECUTIVE-BRIEF', 'PULL_REQUEST_TEMPLATE', 'QUICKSTART', 'README',
]);

/**
 * Discovers agent names from the skills plugin cache by finding folders named `agents/`
 * and reading the .md files inside. Prefers the `name` frontmatter field; falls back to
 * the file name without extension.
 *
 * @returns {string[]} Sorted list of agent names from the plugin cache
 */
function discoverPluginCacheAgentNames() {
  const agentNames = new Set();

  function walkForAgentFolders(directory, depth = 0) {
    if (depth > 6) return;

    let entries;
    try {
      entries = fs.readdirSync(directory);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(directory, entry);

      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory() && entry === 'agents') {
        // Read all .md files directly inside this agents/ folder
        let agentFiles;
        try {
          agentFiles = fs.readdirSync(fullPath);
        } catch {
          continue;
        }

        for (const agentFile of agentFiles) {
          if (!agentFile.endsWith('.md')) continue;

          const agentFilePath = path.join(fullPath, agentFile);
          try {
            const content = fs.readFileSync(agentFilePath, 'utf8');
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

            if (frontmatterMatch) {
              const nameMatch = frontmatterMatch[1].match(/^name:\s*(.+)$/m);
              if (nameMatch) {
                agentNames.add(nameMatch[1].trim());
                continue;
              }
            }

            // Fall back to file name without extension
            agentNames.add(agentFile.replace(/\.md$/, ''));
          } catch {
            // Skip unreadable files
          }
        }
      } else if (stat.isDirectory()) {
        walkForAgentFolders(fullPath, depth + 1);
      }
    }
  }

  walkForAgentFolders(SKILLS_PLUGIN_CACHE);
  return Array.from(agentNames).sort();
}

/**
 * Discovers agent names from the global ~/.claude/agents directory.
 * Reads .md files one level deep inside each category subfolder.
 * Skips root-level meta files and known non-agent filenames.
 *
 * @returns {string[]} Sorted list of agent names from the global agents library
 */
function discoverGlobalAgentNames() {
  const agentNames = new Set();

  let categoryFolders;
  try {
    categoryFolders = fs.readdirSync(GLOBAL_AGENTS_DIR);
  } catch {
    return [];
  }

  for (const categoryFolder of categoryFolders) {
    const categoryPath = path.join(GLOBAL_AGENTS_DIR, categoryFolder);

    let stat;
    try {
      stat = fs.statSync(categoryPath);
    } catch {
      continue;
    }

    if (!stat.isDirectory()) continue;

    let agentFiles;
    try {
      agentFiles = fs.readdirSync(categoryPath);
    } catch {
      continue;
    }

    for (const agentFile of agentFiles) {
      if (!agentFile.endsWith('.md')) continue;

      const agentName = agentFile.replace(/\.md$/, '');

      // Skip known non-agent meta files that live inside category subfolders
      if (GLOBAL_AGENTS_FILE_EXCLUSIONS.has(agentName)) continue;

      agentNames.add(agentName);
    }
  }

  return Array.from(agentNames).sort();
}

module.exports = {
  SKILLS_PLUGIN_CACHE,
  GLOBAL_AGENTS_DIR,
  GLOBAL_AGENTS_FILE_EXCLUSIONS,
  discoverPluginCacheAgentNames,
  discoverGlobalAgentNames,
};
