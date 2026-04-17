'use strict';

const fs = require('fs');
const path = require('path');

const SKILLS_PLUGIN_CACHE = 'C:/Users/Dragus/.claude/plugins/cache';
const GLOBAL_AGENTS_DIR = 'C:/Users/Dragus/.claude/agents';
const MCP_CONFIG_PATH = 'C:/Users/Dragus/AppData/Roaming/Code/User/mcp.json';

// Non-agent files that appear inside category subfolders of the global agents repo
const GLOBAL_AGENTS_FILE_EXCLUSIONS = new Set([
  'CONTRIBUTING', 'EXECUTIVE-BRIEF', 'PULL_REQUEST_TEMPLATE', 'QUICKSTART', 'README',
]);

/**
 * Recursively walks a directory up to maxDepth, invoking visitor(fullPath, fileName)
 * for every file encountered. Silently skips unreadable entries.
 *
 * @param {string} directory - Absolute path to start walking from
 * @param {number} maxDepth - Maximum recursion depth (0 = only direct children)
 * @param {(fullPath: string, fileName: string) => void} visitor
 * @param {number} [currentDepth=0] - Internal recursion counter
 */
function walkDirectory(directory, maxDepth, visitor, currentDepth = 0) {
  if (currentDepth > maxDepth) return;

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

    if (stat.isDirectory()) {
      walkDirectory(fullPath, maxDepth, visitor, currentDepth + 1);
    } else {
      visitor(fullPath, entry);
    }
  }
}

/**
 * Discovers skill names from the skills plugin cache by locating all SKILL.md files.
 * Prefers the `name` frontmatter field; falls back to the parent folder name.
 *
 * @returns {string[]} Sorted list of skill names
 */
function discoverSkillNames() {
  const skillNames = new Set();

  walkDirectory(SKILLS_PLUGIN_CACHE, 6, (fullPath, fileName) => {
    if (fileName !== 'SKILL.md') return;

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch) {
        const nameMatch = frontmatterMatch[1].match(/^name:\s*(.+)$/m);
        if (nameMatch) {
          skillNames.add(nameMatch[1].trim());
          return;
        }
      }

      // Fall back to parent folder name when frontmatter has no name field
      const parentFolder = path.dirname(fullPath).split(/[\\/]/).pop();
      skillNames.add(parentFolder);
    } catch {
      // Skip unreadable files
    }
  });

  return Array.from(skillNames).sort();
}

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

/**
 * Returns a deduplicated, sorted list of all agent names from both the plugin cache
 * and the global ~/.claude/agents directory.
 *
 * @returns {string[]} Combined sorted list of all agent names
 */
function discoverAllAgentNames() {
  const pluginCacheNames = discoverPluginCacheAgentNames();
  const globalNames = discoverGlobalAgentNames();
  return Array.from(new Set([...pluginCacheNames, ...globalNames])).sort();
}

/**
 * Reads MCP server names from the VS Code user-level mcp.json config file.
 *
 * @returns {string[]} Sorted list of MCP server names, or [] if the file is missing/invalid
 */
function discoverMcpServerNames() {
  try {
    const rawConfig = fs.readFileSync(MCP_CONFIG_PATH, 'utf8');
    const config = JSON.parse(rawConfig);
    const servers = config.servers || {};
    return Object.keys(servers).sort();
  } catch {
    return [];
  }
}

module.exports = {
  walkDirectory,
  discoverSkillNames,
  discoverPluginCacheAgentNames,
  discoverGlobalAgentNames,
  discoverAllAgentNames,
  discoverMcpServerNames,
  // Exported for testing only
  GLOBAL_AGENTS_FILE_EXCLUSIONS,
};
