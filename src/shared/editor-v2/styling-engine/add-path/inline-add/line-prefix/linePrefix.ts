/** Computes byte length of the line prefix (list/heading/quote/checkbox/callout markers). */
export function computeLinePrefixLength(sourceText: string, lineStart: number): number {
  const lineEnd = sourceText.indexOf('\n', lineStart);
  const line = sourceText.slice(lineStart, lineEnd === -1 ? sourceText.length : lineEnd);
  // Order matters: most specific first.
  const checkbox = /^- \[ ?\] /.exec(line);
  if (checkbox) return checkbox[0].length;
  const callout = /^> \[![^\]]+\]\s?/.exec(line);
  if (callout) return callout[0].length;
  const heading = /^(?:>\s)?#{1,6}\s/.exec(line);
  if (heading) return heading[0].length;
  const list = /^(?:>\s)?- /.exec(line);
  if (list) return list[0].length;
  const quote = /^>\s/.exec(line);
  if (quote) return quote[0].length;
  return 0;
}
