/** Line prefix patterns stripped by removeAllTags. */
export const LINE_PREFIX_PATTERNS: ReadonlyArray<RegExp> = [
  /^- \[ ?\] /,
  /^> \[![^\]]+\]\s?/,
  /^(?:>\s)?#{1,6}\s/,
  /^(?:>\s)?- /,
  /^>\s/,
  /^#todo /,
];
