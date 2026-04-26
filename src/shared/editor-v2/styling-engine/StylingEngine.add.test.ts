import { toggleTag } from './StylingEngine';
import type { DetectedTag } from './interfaces';
import { BOLD_MD, ITALIC_MD, STRIKETHROUGH_MD, HIGHLIGHT_MD, CODE_MD, BOLD_HTML, ITALIC_HTML } from './constants';
import { selectAll, selectRange, applyReplacements } from './helpers';

// All tests in TDD red state — stubs throw 'not implemented'.

describe('A1 — MD plain context: wrap with MD delimiters', () => {
  it('wraps full word with bold MD (last-to-first: close at 5, open at 0)', () => {
    const result = toggleTag(selectAll('hello'), BOLD_MD);
    expect(result.isNoOp).toBe(false);
    expect(result.replacements).toHaveLength(2);
    expect(result.replacements[0]).toEqual({ fromOffset: 5, toOffset: 5, replacementText: '**' });
    expect(result.replacements[1]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: '**' });
  });
  it('wraps partial selection with italic MD', () => {
    const result = toggleTag(selectRange('hello world', 6, 11), ITALIC_MD);
    expect(result.replacements).toEqual([{ fromOffset: 11, toOffset: 11, replacementText: '*' }, { fromOffset: 6, toOffset: 6, replacementText: '*' }]);
  });

  it.each<[DetectedTag, string]>([
    [STRIKETHROUGH_MD, '~~hello~~'],
    [HIGHLIGHT_MD,     '==hello=='],
    [CODE_MD,          '`hello`'],
  ])('wraps "hello" with MD tag', (tag, expected) => {
    expect(applyReplacements('hello', toggleTag(selectAll('hello'), tag).replacements)).toBe(expected);
  });
});

describe('A2 — MD tag in HTML context: upgrade to HTML equivalent', () => {
  it('upgrades bold MD to <b> when inside <i> context', () => {
    const result = toggleTag(selectRange('<i>hello</i>', 3, 8), BOLD_MD);
    expect(applyReplacements('<i>hello</i>', result.replacements)).toBe('<i><b>hello</b></i>');
  });
});

describe('A3 — HTML closing: wrap with HTML tag', () => {
  it('wraps selection with <b>...</b>', () => {
    expect(toggleTag(selectAll('hello'), BOLD_HTML).replacements).toEqual([{ fromOffset: 5, toOffset: 5, replacementText: '</b>' }, { fromOffset: 0, toOffset: 0, replacementText: '<b>' }]);
  });
});

describe('A4 — Span tag, no same-property: wrap with new span', () => {
  it('wraps with color span when no color span present', () => {
    const result = toggleTag(selectAll('hello'), { type: 'color', isSpan: true });
    expect(result.replacements[0].replacementText).toBe('</span>');
    expect(result.replacements[1].replacementText).toContain('<span style="color');
  });
});

describe('A5 — Span tag, same CSS property: replace attribute value', () => {
  it('replaces color span — no double-wrap', () => {
    const result = toggleTag(selectRange('<span style="color:red">hello</span>', 24, 29), { type: 'color', isSpan: true });
    expect(result.replacements).toHaveLength(1);
    expect(result.replacements[0].replacementText).toContain('<span style="color');
  });
});

describe('A6 — Span tag, different CSS property: nest new span inside existing', () => {
  it('adds font-size span inside existing color span', () => {
    expect(applyReplacements('<span style="color:red">hi</span>', toggleTag(selectRange('<span style="color:red">hi</span>', 24, 26), { type: 'fontSize', isSpan: true }).replacements))
      .toContain('<span style="font-size');
  });
});

describe('A7/A9 — Extend or merge bold tags via selection', () => {
  it.each<[string, number, number, string]>([
    ['**hel**lo world', 7, 15, '**hello world**'],
    ['**a** b **c**',   5, 13, '**a b c**'],
  ])('%s → %s', (sourceText, start, end, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectRange(sourceText, start, end), BOLD_MD).replacements)).toBe(expected);
  });

  it('A9 remove variant: all-covered bold selection routes to Remove', () => {
    expect(applyReplacements('**a** **b** **c**', toggleTag(selectAll('**a** **b** **c**'), BOLD_MD).replacements)).toBe('a b c');
  });
});

describe('A10 — Protected range inside selection: punch out', () => {
  it('wikilink punch-out: wraps only non-protected segments', () => {
    expect(toggleTag(selectAll('before [[link]] after'), BOLD_MD).replacements).toHaveLength(4);
  });

  it('code span punch-out: surrounding text wrapped, code span skipped', () => {
    expect(applyReplacements('before `code` after', toggleTag(selectAll('before `code` after'), BOLD_MD).replacements)).toBe('**before** `code` **after**');
  });
});

describe('A11 — Multi-line, none tagged: add to every line', () => {
  it('wraps each line independently when no line is already tagged', () => {
    expect(applyReplacements('line1\nline2', toggleTag(selectAll('line1\nline2'), BOLD_MD).replacements)).toBe('**line1**\n**line2**');
  });
});

describe('A12 — Multi-line, mixed inline: add to untagged lines only', () => {
  it('skips already-bold line1 and only wraps line2', () => {
    expect(applyReplacements('**line1**\nline2', toggleTag(selectAll('**line1**\nline2'), BOLD_MD).replacements)).toBe('**line1**\n**line2**');
  });

  it('A12/list: adds "- " only to untagged line2 in mixed multi-line list', () => {
    expect(toggleTag(selectAll('- line1\nline2'), { type: 'list' }).replacements.filter((r) => r.replacementText === '- ')).toHaveLength(1);
  });
});

describe('A13–A15 — Single-tag add', () => {
  it.each<[string, object, string]>([
    ['item',  { type: 'list' },    '- '],
    ['title', { type: 'heading' }, '# '],
    ['note',  { type: 'quote' },   '> '],
  ])('A13-A15: "%s" + tag → prepends "%s"', (text, tag, prefix) => {
    const result = toggleTag(selectAll(text), tag as Parameters<typeof toggleTag>[1]);
    expect(result.replacements[0]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: prefix });
  });
});

describe('A16 — Single: indent', () => {
  it('first indent on plain line → margin-left:24px span at start', () => {
    expect(toggleTag(selectAll('item'), { type: 'indent' }).replacements[0].replacementText)
      .toBe('<span style="margin-left:24px"/>');
  });

  it('second indent on 24px line → updates to 48px', () => {
    expect(applyReplacements('<span style="margin-left:24px"/>item', toggleTag(selectAll('<span style="margin-left:24px"/>item'), { type: 'indent' }).replacements))
      .toContain('margin-left:48px');
  });
});

describe('Inert zone: selection inside fenced code → isNoOp', () => {
  it('returns isNoOp=true for bold inside fenced code block', () => {
    expect(toggleTag(selectRange('```\nbold here\n```', 4, 13), BOLD_MD).isNoOp).toBe(true);
  });
});

describe('A17/A18 — Multi-line per-line; MD→HTML upgrade', () => {
  it.each<[string, string]>([
    ['- hello\n- world',  '- **hello**\n- **world**'],
    ['# title text',      '# **title text**'],
    ['> note text',       '> **note text**'],
  ])('bold per-line: %s', (input, expected) => {
    expect(applyReplacements(input, toggleTag(selectAll(input), BOLD_MD).replacements)).toBe(expected);
  });
  it.each<[string, object, string]>([
    ['**hello** world', ITALIC_HTML, '<i><b>hello</b> world</i>'],
    ['*hello*',         BOLD_HTML,   '<b><i>hello</i></b>'],
  ])('%s + tag → %s', (input, tag, expected) => {
    expect(applyReplacements(input, toggleTag(selectAll(input), tag as Parameters<typeof toggleTag>[1]).replacements)).toBe(expected);
  });
});

describe('Special — Checkbox add', () => {
  it.each<[string, string]>([
    ['item',   '- [ ] item'],
    ['- item', '- [ ] item'],  // replaces existing list prefix
  ])('checkbox: "%s" → "%s"', (input, expected) => {
    expect(applyReplacements(input, toggleTag(selectAll(input), { type: 'checkbox' }).replacements)).toBe(expected);
  });
});

describe('Special — Callout/inlineTodo add', () => {
  it('callout: wraps text with "> [!note]" header', () => {
    expect(applyReplacements('text', toggleTag(selectAll('text'), { type: 'callout' }).replacements)).toMatch(/^> \[!\w+\]\n> text$/);
  });
  it('inlineTodo: inserts "#todo " before text', () => {
    expect(applyReplacements('milk', toggleTag(selectAll('milk'), { type: 'inlineTodo' }).replacements)).toBe('#todo milk');
  });
});

describe('Special — meetingDetails add', () => {
  it('prepends meeting block starting with "> ---"', () => {
    expect(applyReplacements('text', toggleTag(selectAll('text'), { type: 'meetingDetails' }).replacements)).toMatch(/^> ---[\s\S]*> ---\s*$/);
  });
});
