# Plan 01 — TypeScript Scaffold

## Goal
Set up the full build toolchain so `npm run build` produces a working `main.js` that Obsidian can load. No visible UI yet — just a plugin that loads and logs "OneNote Ribbon loaded".

## Reference
- `design-mockup-v2.html` — all CSS tokens defined in `:root` block (lines 8–37) are the source of truth for every color, spacing, and radius value used in all subsequent plans.
- `manifest.json` — already exists, id = `onenote-ribbon`.

## Design tokens to hard-code in `src/styles/tokens.css`
Copy exactly from `design-mockup-v2.html` `:root` block:
```
--ribbon-purple:     #6B2CA6
--ribbon-purple-mid: #7B3CB6
--ribbon-bg:         #ffffff
--ribbon-border:     #e1dfdd
--btn-hover-bg:      #f0eeec
--btn-hover-border:  #c8c6c4
--btn-active-bg:     #c7e0f4
--btn-active-border: #90c2e8
--btn-focus-ring:    #0078D4
--text-primary:      #201f1e
--text-secondary:    #484644
--text-muted:        #605e5c
--text-disabled:     #a19f9d
--shadow-ribbon:     0 1px 3px rgba(107,44,166,0.08), 0 2px 8px rgba(0,0,0,0.10)
--transition-fast:   150ms ease-out
--transition-mid:    200ms ease-out
--radius-sm:         3px
--icon-color:        #3b3a39
--icon-purple:       #6B2CA6
--icon-blue:         #0078D4
--icon-green:        #107C10
--icon-orange:       #C45911
--icon-red:          #A80000
--icon-teal:         #006B6B
```

## Files to create

### `package.json`
```json
{
  "name": "onenote-ribbon",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "node esbuild.config.mjs",
    "dev": "node esbuild.config.mjs --watch"
  },
  "dependencies": {
    "obsidian": "latest"
  },
  "devDependencies": {
    "esbuild": "^0.20.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "outDir": "dist",
    "lib": ["ES2020", "DOM"],
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

### `esbuild.config.mjs`
```js
import esbuild from 'esbuild';
import { readFileSync } from 'fs';

const watch = process.argv.includes('--watch');
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*'],
  format: 'cjs',
  target: 'es2020',
  outfile: 'main.js',
  sourcemap: 'inline',
  platform: 'browser',
  define: { 'process.env.NODE_ENV': '"development"' },
});

if (watch) {
  await ctx.watch();
  console.log('Watching…');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
```

### `src/main.ts`
```ts
import { Plugin } from 'obsidian';

export default class OneNoteRibbonPlugin extends Plugin {
  async onload() {
    console.log('OneNote Ribbon loaded');
  }

  onunload() {
    console.log('OneNote Ribbon unloaded');
  }
}
```

### `src/styles/tokens.css`
Copy the full `:root { … }` block from `design-mockup-v2.html` lines 8–37.

## Steps
1. Create all files above.
2. Run `npm install`.
3. Run `npm run build` — must produce `main.js` with no errors.
4. In Obsidian: Settings → Community Plugins → enable `onenote-ribbon`.

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 02 until all checks are green.**

### Reference screenshot
The reference for Plan 01 is **normal Obsidian with zero visible changes** — no ribbon, no extra elements above the workspace.

Take a reference screenshot of Obsidian *before* enabling the plugin:
```
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-01-before.png' })
```

### Check 1 — Obsidian is reachable
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty: Obsidian is not open or not running with `--remote-debugging-port=9222`.

### Check 2 — Plugin is loaded
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!app.plugins.plugins['onenote-ribbon']`
})
```
✅ Must return `true`. If `false`: re-enable plugin in Settings → Community Plugins.

### Check 3 — Console log present
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Must contain a message with text `"OneNote Ribbon loaded"`.

### Check 4 — No ribbon DOM element yet
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => document.getElementById('onenote-ribbon-root')`
})
```
✅ Must return `null`. The shell is built in Plan 02 — if it appears here something is wrong.

### Check 5 — Live screenshot matches reference
```
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-01-after.png' })
```
Open both `plans/screenshots/ref-01-before.png` and `plans/screenshots/live-01-after.png` side by side.
✅ Must look identical — no extra elements, no layout shift, no errors visible in UI.

### Check 6 — No console errors
From `mcp__obsidian-devtools__list_console_messages()` output:
✅ Zero messages with type `"error"` or `"warn"` related to `onenote-ribbon`.

## ❌ NOT complete until
- [ ] Check 1 passes (Obsidian reachable)
- [ ] Check 2 passes (plugin loaded)
- [ ] Check 3 passes (console log visible)
- [ ] Check 4 passes (no ribbon DOM yet)
- [ ] Check 5 passes (live screenshot = blank Obsidian, no visual change)
- [ ] Check 6 passes (zero errors in console)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.
