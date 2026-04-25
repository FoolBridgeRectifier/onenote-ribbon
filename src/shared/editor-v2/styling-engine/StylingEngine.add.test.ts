import { toggleTag } from './StylingEngine';
import type { StylingContext } from './interfaces';
import { BOLD_MD, ITALIC_MD, BOLD_HTML, UNDERLINE_HTML } from './constants';

// All tests are in TDD red state — stubs throw 'not implemented'.
// Once implemented, each test must pass exactly as written.

// Helper: selects the entire sourceText
function selectAll(sourceText: string): StylingContext {
  return { sourceText, selectionStartOffset: 0, selectionEndOffset: sourceText.length };
}

// Helper: selects a substring by start and end offset
function selectRange(sourceText: string, start: number, end: number): StylingContext {
  return { sourceText, selectionStartOffset: start, selectionEndOffset: end };
}

describe('A1 — MD plain context: wrap with MD delimiters', () => {
  it('wraps full word with bold MD', () => {
    const result = toggleTag(selectAll('hello'), BOLD_MD);
    expect(result.isNoOp).toBe(false);
    // Last-to-first: closing at offset 5, then opening at offset 0
    expect(result.replacements).toHaveLength(2);
    expect(result.replacements[0]).toEqual({ fromOffset: 5, toOffset: 5, replacementText: '**' });
    expect(result.replacements[1]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: '**' });
  });

  it('wraps partial selection with italic MD', () => {
    const result = toggleTag(selectRange('hello world', 6, 11), ITALIC_MD);
    expect(result.replacements[0]).toEqual({ fromOffset: 11, toOffset: 11, replacementText: '*' });
    expect(result.replacements[1]).toEqual({ fromOffset: 6, toOffset: 6, replacementText: '*' });
  });
});

describe('A2 — MD tag in HTML context: upgrade to HTML equivalent', () => {
  it('upgrades bold MD to <b> when inside HTML context', () => {
    // Selection "hello" is inside <i>...</i> (HTML context)
    const sourceText = '<i>hello</i>';
    const result = toggleTag(selectRange(sourceText, 3, 8), BOLD_MD);
    expect(result.isNoOp).toBe(false);
    // Must produce <b>hello</b> inside, not **hello**
    expect(result.replacements[0]).toEqual({ fromOffset: 8, toOffset: 8, replacementText: '</b>' });
    expect(result.replacements[1]).toEqual({ fromOffset: 3, toOffset: 3, replacementText: '<b>' });
  });
});

describe('A3 — HTML closing: wrap with HTML tag', () => {
  it('wraps selection with <b>...</b>', () => {
    const result = toggleTag(selectAll('hello'), BOLD_HTML);
    expect(result.replacements[0]).toEqual({ fromOffset: 5, toOffset: 5, replacementText: '</b>' });
    expect(result.replacements[1]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: '<b>' });
  });

  it('wraps selection with <u>...</u>', () => {
    const result = toggleTag(selectAll('world'), UNDERLINE_HTML);
    expect(result.replacements[0]).toEqual({ fromOffset: 5, toOffset: 5, replacementText: '</u>' });
    expect(result.replacements[1]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: '<u>' });
  });
});

describe('A4 — Span tag, no same-property: wrap with new span', () => {
  it('wraps with color span when no color span present', () => {
    const result = toggleTag(selectAll('hello'), {
      kind: 'html-span',
      cssProperty: 'color',
      cssValue: 'red',
    });
    expect(result.isNoOp).toBe(false);
    expect(result.replacements[0].replacementText).toBe('</span>');
    expect(result.replacements[1].replacementText).toBe('<span style="color:red">');
  });
});

describe('A5 — Span tag, same CSS property enclosing: replace attribute value', () => {
  it('replaces color:red with color:blue without double-wrapping', () => {
    const sourceText = '<span style="color:red">hello</span>';
    // Select "hello" at offset 24..29
    const result = toggleTag(selectRange(sourceText, 24, 29), {
      kind: 'html-span',
      cssProperty: 'color',
      cssValue: 'blue',
    });
    expect(result.isNoOp).toBe(false);
    // Single replacement: swap attribute value in-place
    expect(result.replacements).toHaveLength(1);
    expect(result.replacements[0].replacementText).toBe('<span style="color:blue">');
  });
});

describe('A10 — Protected range inside selection: punch out', () => {
  it('wraps only non-protected segments when wikilink is in selection', () => {
    // "before [[link]] after" — select entire string
    const sourceText = 'before [[link]] after';
    const result = toggleTag(selectAll(sourceText), BOLD_MD);
    expect(result.isNoOp).toBe(false);
    // "before " and " after" get bold; [[link]] is untouched
    const outputParts = result.replacements.map((rep) => rep.replacementText);
    expect(outputParts).not.toContain('[[link]]');
    // Must have 4 replacements: open+close for each of the 2 segments
    expect(result.replacements).toHaveLength(4);
  });
});

describe('A13–A16 — Single / line-level add', () => {
  it('A13: prepends "- " for list tag on plain line', () => {
    const result = toggleTag(selectAll('item'), { kind: 'single', singleType: 'list' });
    expect(result.replacements).toHaveLength(1);
    expect(result.replacements[0]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: '- ' });
  });

  it('A14: prepends "# " for heading h1 on plain line', () => {
    const result = toggleTag(selectAll('title'), {
      kind: 'single',
      singleType: 'heading',
      headingLevel: 1,
    });
    expect(result.replacements[0]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: '# ' });
  });

  it('A14: prepends "## " for heading h2', () => {
    const result = toggleTag(selectAll('title'), {
      kind: 'single',
      singleType: 'heading',
      headingLevel: 2,
    });
    expect(result.replacements[0].replacementText).toBe('## ');
  });

  it('A15: prepends "> " for quote tag on plain line', () => {
    const result = toggleTag(selectAll('note'), { kind: 'single', singleType: 'quote' });
    expect(result.replacements[0].replacementText).toBe('> ');
  });

  it('A16: inserts indent span after line start for indent tag', () => {
    const result = toggleTag(selectAll('item'), { kind: 'single', singleType: 'indent' });
    expect(result.replacements[0].replacementText).toBe('<span style="margin-left:24px"/>');
  });

  it('A16: increases indent to 48px on second toggle', () => {
    const sourceText = '<span style="margin-left:24px"/>item';
    const result = toggleTag(selectAll(sourceText), { kind: 'single', singleType: 'indent' });
    expect(result.replacements[0].replacementText).toBe('<span style="margin-left:48px"/>');
  });

  it('A13: adds list to all untagged lines in multi-line mixed selection (A12)', () => {
    const sourceText = '- line1\nline2';
    const result = toggleTag(selectAll(sourceText), { kind: 'single', singleType: 'list' });
    // Only line2 gets "- " prepended
    const addedPrefixes = result.replacements.map((rep) => rep.replacementText);
    expect(addedPrefixes.filter((text) => text === '- ')).toHaveLength(1);
  });
});

describe('Inert zone: cursor in fenced code block returns no-op', () => {
  it('returns isNoOp=true for selection inside fenced code block', () => {
    const sourceText = '```\nbold here\n```';
    // Select "bold here" at offset 4..13
    const result = toggleTag(selectRange(sourceText, 4, 13), BOLD_MD);
    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
  });
});
