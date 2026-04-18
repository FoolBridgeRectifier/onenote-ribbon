import * as esbuild from 'esbuild';

import { MODULE_PREAMBLE_LINES, MODULE_POSTAMBLE_LINES } from './constants';

export async function buildSuiteExpression(
  entryFilePath: string,
): Promise<string> {
  const buildResult = await esbuild.build({
    entryPoints: [entryFilePath],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'browser',
    target: ['es2020'],
    logLevel: 'silent',
  });

  const bundledSource = buildResult.outputFiles[0]?.text;

  if (!bundledSource) {
    throw new Error(`No bundled source produced for ${entryFilePath}`);
  }

  return [
    ...MODULE_PREAMBLE_LINES,
    bundledSource,
    ...MODULE_POSTAMBLE_LINES,
  ].join('\n');
}
