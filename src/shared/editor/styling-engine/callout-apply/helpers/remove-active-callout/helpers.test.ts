import { countPrefixBlockquotes } from './helpers';

describe('countPrefixBlockquotes', () => {
  it('returns 0 for a plain line with no ">" prefix', () => {
    expect(countPrefixBlockquotes('Just some text')).toBe(0);
  });

  it('returns 0 for an empty string', () => {
    expect(countPrefixBlockquotes('')).toBe(0);
  });

  it('returns 1 for a single "> " prefix', () => {
    expect(countPrefixBlockquotes('> line content')).toBe(1);
  });

  it('returns 1 for a bare ">" with no trailing space', () => {
    expect(countPrefixBlockquotes('>line content')).toBe(1);
  });

  it('returns 2 for the compact ">>" prefix (plugin-generated nested callout)', () => {
    expect(countPrefixBlockquotes('>> [!important] Important')).toBe(2);
  });

  it('returns 2 for the spaced "> > " prefix (Obsidian native nested callout)', () => {
    expect(countPrefixBlockquotes('> > nested content')).toBe(2);
  });

  it('returns 3 for ">>>" (triple nesting)', () => {
    expect(countPrefixBlockquotes('>>> deep content')).toBe(3);
  });

  it('returns 3 for "> > > " (triple spaced nesting)', () => {
    expect(countPrefixBlockquotes('> > > deep content')).toBe(3);
  });

  it('returns 0 when the line starts with content that is not ">"', () => {
    expect(countPrefixBlockquotes('- [ ] task line')).toBe(0);
  });

  it('counts only leading ">" characters — ignores ">" elsewhere in the line', () => {
    // Only the leading prefix counts; mid-line ">" should be ignored
    expect(countPrefixBlockquotes('> text with > inside')).toBe(1);
  });
});
