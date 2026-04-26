import { toggleTag, copyFormat } from './StylingEngine';
import { BOLD_MD, ITALIC_MD, HIGHLIGHT_MD } from './constants';
import { selectAll, selectRange, applyReplacements } from './helpers';
// All tests in TDD red state — stubs throw 'not implemented'.

describe('X2 — MD tag inside HTML context: upgrade to HTML', () => {
  it('upgrades ** to <b> when toggling bold inside <i>text</i>', () => {
    expect(applyReplacements('<i>hello</i>', toggleTag(selectRange('<i>hello</i>', 3, 8), BOLD_MD).replacements))
      .toBe('<i><b>hello</b></i>');
  });
  it('does not insert MD ** inside any HTML context (invariant I2)', () => {
    const output = applyReplacements('<b>text</b>', toggleTag(selectRange('<b>text</b>', 3, 7), ITALIC_MD).replacements);
    expect(output).not.toContain('*text*');
    expect(output).toContain('<i>');
  });
});

describe('X4–X5 — Heading/list mutual swap', () => {
  it.each<[string, Parameters<typeof toggleTag>[1], string]>([
    ['- item',  { type: 'heading' }, '# item'],
    ['# title', { type: 'list' },    '- title'],
  ])('%s + tag → %s', (sourceText, tag, expected) => {
    expect(applyReplacements(sourceText, toggleTag(selectAll(sourceText), tag).replacements)).toBe(expected);
  });
});

describe('X6–X7 — Quote prefix coexists with list/heading', () => {
  it('X6: "- " added inside "> " line, quote prefix preserved', () => {
    expect(applyReplacements('> item', toggleTag(selectAll('> item'), { type: 'list' }).replacements))
      .toBe('> - item');
  });

  it('X7: "# " added inside "> " line, quote prefix preserved', () => {
    expect(applyReplacements('> item', toggleTag(selectAll('> item'), { type: 'heading' }).replacements))
      .toBe('> # item');
  });
});

describe('X8 — Callout block + list: body lines get "- " prefix, header unchanged', () => {
  it('adds "- " to content line but leaves callout header intact', () => {
    const sourceText = '> [!note] Title\n> content';
    const output = applyReplacements(sourceText, toggleTag(selectAll(sourceText), { type: 'list' }).replacements);
    expect(output).toContain('> [!note] Title');
    expect(output).toContain('> - content');
  });
});

describe('X9 — Indent placed AFTER line prefix (not at line start)', () => {
  it.each<[string, string]>([
    ['# title',  '# <span style="margin-left:24px"/>title'],
    ['> note',   '> <span style="margin-left:24px"/>note'],
    ['- item',   '- <span style="margin-left:24px"/>item'],
  ])('indent on "%s" -> prefix preserved, span after prefix', (input, expected) => {
    expect(applyReplacements(input, toggleTag(selectAll(input), { type: 'indent' }).replacements))
      .toBe(expected);
  });
});

describe('X10 — Inline tag after line prefix: wraps only the content', () => {
  it.each<[string, string]>([
    ['> note',   '> **note**'],
    ['- item',   '- **item**'],
    ['# title',  '# **title**'],
  ])('bold on "%s" → content-only wrap', (input, expected) => {
    expect(applyReplacements(input, toggleTag(selectAll(input), BOLD_MD).replacements)).toBe(expected);
  });
});

describe('X12 — Code span content is inert', () => {
  it('returns isNoOp=true when selection is entirely inside code span', () => {
    expect(toggleTag(selectRange('`hello`', 1, 6), BOLD_MD).isNoOp).toBe(true);
  });
});

describe('X13 — Highlight in HTML context: uses background span', () => {
  it('wraps highlighted text with background span inside <b> (no == MD delimiters)', () => {
    const sourceText = '<b>==hello==</b>';
    const output = applyReplacements(sourceText, toggleTag(selectAll(sourceText), HIGHLIGHT_MD).replacements);
    expect(output).toContain('<span style="background');
    expect(output).not.toContain('==');
  });
});

describe('X14 — Custom background span add', () => {
  it('wraps selection with background span and never emits == delimiters', () => {
    const output = applyReplacements('hello', toggleTag(selectAll('hello'), { type: 'highlight', isSpan: true }).replacements);
    expect(output).toContain('<span style="background');
    expect(output).not.toContain('==');
  });
});

describe('X15 — Nested callout inside existing callout', () => {
  it('wraps body of existing note callout with a new tip callout', () => {
    const sourceText = '> [!note] A\n> text';
    const output = applyReplacements(sourceText, toggleTag(selectAll(sourceText), { type: 'callout' }).replacements);
    expect(output).toContain('> [!note] A');
    expect(output).toContain('> > [!tip]');
    expect(output).toContain('> > text');
  });
});

describe('X16 — Checkbox replaces callout', () => {
  it('converts callout block to a checkbox item and strips "> " from child lines', () => {
    const sourceText = '> [!note] Title\n> content';
    const output = applyReplacements(sourceText, toggleTag(selectAll(sourceText), { type: 'checkbox' }).replacements);
    expect(output).toContain('- [ ] Title');
    expect(output).not.toContain('> content');
    expect(output).toContain('content');
  });
});


describe('X11 — Single-tag applied across multi-line selection: per-line', () => {
  it('applies "- " to every line when list tag is toggled across a multi-line selection', () => {
    expect(applyReplacements('line1\nline2', toggleTag(selectAll('line1\nline2'), { type: 'list' }).replacements))
      .toBe('- line1\n- line2');
  });

  it('applies bold to each line independently when toggling across a 2-line selection', () => {
    expect(applyReplacements('line1\nline2', toggleTag(selectAll('line1\nline2'), BOLD_MD).replacements)).toBe('**line1**\n**line2**');
  });
});

describe('I1 — No stacked active tags of the same type', () => {
  it('routes to remove path instead of re-wrapping when bold already active', () => {
    const output = applyReplacements('**hello**', toggleTag(selectRange('**hello**', 2, 7), BOLD_MD).replacements);
    // Must not produce triple-nested bold
    expect(output).not.toMatch(/\*\*.*\*\*.*\*\*.*\*\*/);
  });
  it('isNoOp is false when full tag selection routes to remove path', () => {
    expect(toggleTag(selectAll('**hello**'), BOLD_MD).isNoOp).toBe(false);
  });
});

describe('I4 — Single-line-tag always applies to line start, not cursor position', () => {
  it('prepends "- " at column 0 regardless of cursor being in middle of line', () => {
    expect(applyReplacements('hello', toggleTag(selectRange('hello', 3, 3), { type: 'list' }).replacements))
      .toBe('- hello');
  });
});

describe('I5–I6 — Indent uses tab inside list; removes with list', () => {
  it('I5: uses \\t instead of margin-left span when indenting inside list item', () => {
    const result = toggleTag(selectAll('- item'), { type: 'indent' });
    expect(result.replacements.some((rep) => rep.replacementText.includes('\t'))).toBe(true);
  });
  it('I6: removes all leading \\t when list marker is removed', () => {
    expect(applyReplacements('- \t\titem', toggleTag(selectAll('- \t\titem'), { type: 'list' }).replacements))
      .toBe('item');
  });
});

describe('copyFormat', () => {
  it.each<[string, number, number, string, boolean]>([
    ['**hello**', 4, 4, 'markdown', false],
    ['<b>hello</b>', 3, 8, 'html', false],
  ])('captures domain "%s" from "%s"', (sourceText, start, end, expectedDomain) => {
    expect(copyFormat(selectRange(sourceText, start, end)).domain).toBe(expectedDomain);
  });
  it('captures bold MD tag at cursor', () => {
    expect(copyFormat(selectRange('**hello**', 4, 4)).tagDefinitions.some((tag) => tag.type === 'bold')).toBe(true);
  });
  it('captures lineTagDefinition when cursor is on list line', () => {
    const format = copyFormat(selectRange('- item', 3, 3));
    expect(format.lineTagDefinition).toBeDefined();
    expect(format.lineTagDefinition!.type).toBe('list');
  });

  it('returns empty tagDefinitions on plain text', () => {
    const format = copyFormat(selectAll('plain'));
    expect(format.tagDefinitions).toHaveLength(0);
    expect(format.lineTagDefinition).toBeUndefined();
  });
});
