import esbuild from 'esbuild';
import { readFileSync } from 'fs';

const watch = process.argv.includes('--watch');
// Package.json is read but not used directly - it's available for future use
void JSON.parse(readFileSync('./package.json', 'utf8'));

// Inject CSS as inline styles into the JS bundle
const injectCssPlugin = {
  name: 'inject-css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = readFileSync(args.path, 'utf8');
      const escaped = JSON.stringify(css);
      return {
        contents: `
          const style = document.createElement('style');
          style.textContent = ${escaped};
          document.head.appendChild(style);
          export default undefined;
        `,
        loader: 'js'
      };
    });
  }
};

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron', '@electron/remote', '@codemirror/*', '@lezer/*', 'os', 'path', 'fs'],
  format: 'cjs',
  target: 'es2020',
  outfile: 'main.js',
  sourcemap: 'inline',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [injectCssPlugin]
});

if (watch) {
  await ctx.watch();
  console.log('Watching…');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
