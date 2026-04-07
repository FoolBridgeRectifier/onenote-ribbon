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
