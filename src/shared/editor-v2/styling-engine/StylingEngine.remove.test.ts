import { toggleTag, removeAllTags } from './StylingEngine';
import { BOLD_MD, ITALIC_MD, STRIKETHROUGH_MD, HIGHLIGHT_MD, CODE_MD, BOLD_HTML, ITALIC_HTML, UNDERLINE_HTML, SUBSCRIPT_HTML, SUPERSCRIPT_HTML } from './constants';
import { selectAll, selectRange, applyReplacements } from './helpers';

// All tests in TDD red state — stubs throw 'not implemented'.

describe('R1/R4/R5 — Exact-match remove produces bare content', () => {
  it.each<[string, Parameters<typeof toggleTag>[1], string]>([
    ['**hello**',        BOLD_MD,          'hello'],
    ['*hello*',          ITALIC_MD,        'hello'],
    ['~~hello~~',        STRIKETHROUGH_MD, 'hello'],
    ['==hello==',        HIGHLIGHT_MD,     'hello'],
    ['`hello`',          CODE_MD,          'hello'],
    ['<b>hello</b>',     BOLD_HTML,        'hello'],
    ['<i>hello</i>',     ITALIC_HTML,      'hello'],
    ['<u>hello</u>',     UNDERLINE_HTML,   'hello'],
  ])('%s + tag → "%s"', (sourceText, tag, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectAll(sourceText), tag).replacements)).toBe(expected);
  });
});

describe('R2 — MD partial punch-out: un-tag only the selected characters', () => {
  it('punch-out "lo" from **hello** at offsets 5..7 produces **hel**lo', () => {
    expect(toggleTag(selectRange('**hello**', 5, 7), BOLD_MD).isNoOp).toBe(false);
    expect(applyReplacements('**hello**', toggleTag(selectRange('**hello**', 5, 7), BOLD_MD).replacements)).toBe('**hel**lo');
  });
});

describe('R6/R7/R8 — HTML partial punch-out', () => {
  it.each<[string, number, number, Parameters<typeof toggleTag>[1], string]>([
    ['<b>hello</b>',  6,  8,  BOLD_HTML,   '<b>hel</b>lo'],
    ['<i>world</i>',  6,  8,  ITALIC_HTML, '<i>wor</i>ld'],
  ])('%s punch-out → %s', (sourceText, start, end, tag, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectRange(sourceText, start, end), tag).replacements)).toBe(expected);
  });

  it('R8: span partial punch-out removes span from selected portion only', () => {
    expect(applyReplacements('<span style="color:red">hello</span>', toggleTag(selectRange('<span style="color:red">hello</span>', 27, 29), { type: 'color', isSpan: true }).replacements))
      .toBe('<span style="color:red">hel</span>lo');
  });
});

describe('R9 — MD + HTML equivalent both present: remove both layers', () => {
  it('removes both ** and <b> from <b>**hello**</b>', () => {
    expect(applyReplacements('<b>**hello**</b>', toggleTag(selectAll('<b>**hello**</b>'), BOLD_MD).replacements)).toBe('hello');
  });
});

describe('R10–R11 — sub/sup mutual-exclusion swap', () => {
  it.each<[string, Parameters<typeof toggleTag>[1], string]>([
    ['<sub>x</sub>', SUPERSCRIPT_HTML, '<sup>x</sup>'],
    ['<sup>x</sup>', SUBSCRIPT_HTML,   '<sub>x</sub>'],
  ])('%s + tag → %s', (sourceText, tag, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectAll(sourceText), tag).replacements)).toBe(expected);
  });

  it('R12: sub/sup partial selection — swaps and punch-outs selected portion', () => {
    expect(applyReplacements('<sub>hello</sub>', toggleTag(selectRange('<sub>hello</sub>', 8, 10), SUPERSCRIPT_HTML).replacements)).toBe('<sup>hel</sup>lo');
  });
});

describe('R12/R13 — Span remove; stacked duplicates', () => {
  it('removes color span to leave bare text', () => {
    expect(applyReplacements('<span style="color:red">hello</span>', toggleTag(selectAll('<span style="color:red">hello</span>'), { type: 'color', isSpan: true }).replacements)).toBe('hello');
  });
  it('removes all layers of <b><b>hello</b></b>', () => {
    expect(applyReplacements('<b><b>hello</b></b>', toggleTag(selectAll('<b><b>hello</b></b>'), BOLD_HTML).replacements)).toBe('hello');
  });
});

describe('R14 — Span remove: type match', () => {
  it('removes color span regardless of specific value (type match is sufficient)', () => {
    expect(applyReplacements('<span style="color:blue">hi</span>', toggleTag(selectAll('<span style="color:blue">hi</span>'), { type: 'color', isSpan: true }).replacements)).toBe('hi');
  });
});

describe('R15 — Span with multiple CSS properties: only strip matched type', () => {
  it('updates span to remove only color-type when font-size remains', () => {
    const output = applyReplacements('<span style="color:red;font-size:14pt">hi</span>', toggleTag(selectAll('<span style="color:red;font-size:14pt">hi</span>'), { type: 'color', isSpan: true }).replacements);
    expect(output).toContain('font-size:14pt');
    expect(output).not.toContain('color:red');
  });
});

describe('R16–R18 — Single line-prefix remove', () => {
  it.each<[string, Parameters<typeof toggleTag>[1]]>([
    ['- item',  { type: 'list' }],
    ['# title', { type: 'heading' }],
    ['> note',  { type: 'quote' }],
  ])('removes 2-char prefix from "%s"', (sourceText, tag) => {
    expect(toggleTag(selectAll(sourceText), tag).replacements[0]).toEqual({ fromOffset: 0, toOffset: 2, replacementText: '' });
  });
});

describe('R19 — Indent remove: decrement step-wise', () => {
  it.each<[string, string]>([
    ['<span style="margin-left:48px"/>item', 'margin-left:24px'],
    ['<span style="margin-left:24px"/>item', 'item'],
  ])('%s → decrements or removes indent', (sourceText, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectAll(sourceText), { type: 'indent' }).replacements)).toContain(expected);
  });
});
describe('removeAllTags', () => {
  it.each<[string, string]>([
    ['**_hello_**',                              'hello'],
    ['<span style="color:red"><b>hi</b></span>', 'hi'],
    ['- **hello**',                              'hello'],  // line prefix + inline tags both removed
  ])('removes all tags from "%s" → "%s"', (sourceText, expected) => {
    expect(applyReplacements(sourceText, removeAllTags(selectAll(sourceText)).replacements)).toBe(expected);
  });

  it('returns isNoOp=true when no tags present', () => {
    expect(removeAllTags(selectAll('plain text')).isNoOp).toBe(true);
  });
});
describe('R14–R15 — Multi-line remove', () => {
  it.each<[string, string]>([
    ['**l1**\n**l2**', 'l1\nl2'],  // R14: all lines tagged -> remove from all
    ['**l1**\nl2',     'l1\nl2'],  // R15: mixed -> remove only from tagged lines
  ])('toggleTag(%s) -> %s', (sourceText, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectAll(sourceText), BOLD_MD).replacements)).toBe(expected);
  });
});

describe('R20 — Last HTML context removed: downgrade inner tags to MD equivalents', () => {
  it.each<[string, string]>([
    ['<b><i>hello</i></b>',              '*hello*'],
    ['<b><span style="color:red">hi</span></b>', '<span style="color:red">hi</span>'],
  ])('removing outer <b> from %s downgrades inner tag', (sourceText, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectAll(sourceText), BOLD_HTML).replacements)).toBe(expected);
  });

  it('does not downgrade <b> when outer <i> still provides HTML context', () => {
    expect(applyReplacements('<i><b>hello</b></i>', toggleTag(selectRange('<i><b>hello</b></i>', 3, 15), BOLD_HTML).replacements)).toBe('<i>hello</i>');
  });
});

describe('R1 — Content-only selection removes enclosing tag', () => {
  it('removes ** when selection is content-only (ch:2..7) and does not include delimiter characters', () => {
    expect(applyReplacements('**hello**', toggleTag(selectRange('**hello**', 2, 7), BOLD_MD).replacements)).toBe('hello');
  });
});

describe('Special — Checkbox/callout remove; quote-in-callout no-op', () => {
  it('removes "- [ ] " prefix and restores plain line', () => {
    expect(applyReplacements('- [ ] task', toggleTag(selectAll('- [ ] task'), { type: 'checkbox' }).replacements)).toBe('task');
  });

  it('removes callout header leaving body without [!note] marker', () => {
    expect(applyReplacements('> [!note] Title\n> content', toggleTag(selectAll('> [!note] Title\n> content'), { type: 'callout' }).replacements)).not.toContain('[!note]');
  });

  it('returns isNoOp=true when removing quote from a callout line', () => {
    expect(toggleTag(selectAll('> [!note] Title'), { type: 'quote' }).isNoOp).toBe(true);
  });
});

describe('Protected ranges — remove outer tag across both segments', () => {
  it('removes bold from both text segments flanking [[link]] wikilink', () => {
    expect(applyReplacements('**before**[[link]]**after**', toggleTag(selectAll('**before**[[link]]**after**'), BOLD_MD).replacements)).toBe('before[[link]]after');
  });
});

describe('Special — inlineTodo remove', () => {
  it('removes "#todo " prefix from selected text', () => {
    expect(applyReplacements('#todo milk', toggleTag(selectAll('#todo milk'), { type: 'inlineTodo' }).replacements)).toBe('milk');
  });
});

describe('Special — meetingDetails remove', () => {
  it('removes meeting block and leaves bare content', () => {
    const stripped = applyReplacements('> ---\nDate:\n> ---\ntext', toggleTag(selectAll('> ---\nDate:\n> ---\ntext'), { type: 'meetingDetails' }).replacements);
    expect(stripped).toContain('text');
    expect(stripped).not.toContain('> ---');
  });
});
