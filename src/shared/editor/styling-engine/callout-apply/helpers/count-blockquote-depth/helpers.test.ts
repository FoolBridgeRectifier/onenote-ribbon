import { countBlockquoteDepth } from './helpers';

describe('countBlockquoteDepth', () => {
  it('returns 0 for a line with no blockquote prefix', () => {
    expect(countBlockquoteDepth('Normal paragraph')).toBe(0);
  });

  it('returns 1 for a single-level blockquote line', () => {
    expect(countBlockquoteDepth('> body')).toBe(1);
  });

  it('returns 1 for a callout header line', () => {
    expect(countBlockquoteDepth('> [!important] Important')).toBe(1);
  });

  it('returns 2 for a depth-2 nested line', () => {
    expect(countBlockquoteDepth('>> [!question] Question')).toBe(2);
  });

  it('returns 3 for a depth-3 nested line', () => {
    expect(countBlockquoteDepth('>>> [!note] Note')).toBe(3);
  });

  it('handles lines with spaces between ">" characters', () => {
    expect(countBlockquoteDepth('> > body')).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(countBlockquoteDepth('')).toBe(0);
  });
});
