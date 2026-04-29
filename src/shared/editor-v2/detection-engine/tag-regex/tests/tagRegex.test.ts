import { describe, it, expect } from 'vitest';
import {
  MD_TAG_REGEX,
  HTML_EQUIV_MD_TAG_REGEX,
  HTML_TAG_REGEX,
  SPAN_TAG_REGEX,
  LINE_TAG_REGEX,
  SPECIAL_TAG_REGEX,
} from '../tagRegex';
import {
  EMdStyleTagType,
  EHtmlStyleTagType,
  ESpanStyleTagType,
  ELineTagType,
  ESpecialTagType,
} from '../../../interfaces';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Test a pattern by slicing the line from cursor — mimics scanner usage. */
function matchesAtCursor(pattern: RegExp, line: string, cursor: number): boolean {
  return pattern.test(line.slice(cursor));
}

// ── MD style tags ────────────────────────────────────────────────────────────

describe('MD_TAG_REGEX', () => {
  it('covers all EMdStyleTagType values', () => {
    const covered = new Set(MD_TAG_REGEX.map((entry) => entry.type));
    const allTypes = Object.values(EMdStyleTagType);
    expect([...covered].sort()).toEqual(allTypes.sort());
  });

  it('BOLD delimiter matches ** at cursor', () => {
    const entry = MD_TAG_REGEX.find((e) => e.type === EMdStyleTagType.BOLD)!;
    expect(matchesAtCursor(entry.delimiter, '**hello**', 0)).toBe(true);
    expect(matchesAtCursor(entry.delimiter, '**hello**', 7)).toBe(true);
    expect(matchesAtCursor(entry.delimiter, '*hello*', 0)).toBe(false);
  });

  it('ITALIC delimiter matches lone * at cursor', () => {
    const entry = MD_TAG_REGEX.find((e) => e.type === EMdStyleTagType.ITALIC)!;
    expect(matchesAtCursor(entry.delimiter, '*hello*', 0)).toBe(true);
    expect(matchesAtCursor(entry.delimiter, '*hello*', 6)).toBe(true);
  });

  it('STRIKETHROUGH delimiter matches ~~ at cursor', () => {
    const entry = MD_TAG_REGEX.find((e) => e.type === EMdStyleTagType.STRIKETHROUGH)!;
    expect(matchesAtCursor(entry.delimiter, '~~hello~~', 0)).toBe(true);
    expect(matchesAtCursor(entry.delimiter, '~~hello~~', 7)).toBe(true);
    expect(matchesAtCursor(entry.delimiter, '~hello~', 0)).toBe(false);
  });

  it('HIGHLIGHT delimiter matches == at cursor', () => {
    const entry = MD_TAG_REGEX.find((e) => e.type === EMdStyleTagType.HIGHLIGHT)!;
    expect(matchesAtCursor(entry.delimiter, '==hello==', 0)).toBe(true);
    expect(matchesAtCursor(entry.delimiter, '==hello==', 7)).toBe(true);
    expect(matchesAtCursor(entry.delimiter, '=hello=', 0)).toBe(false);
  });

  it('BOLD appears before ITALIC in registry order', () => {
    const boldIndex = MD_TAG_REGEX.findIndex((e) => e.type === EMdStyleTagType.BOLD);
    const italicIndex = MD_TAG_REGEX.findIndex((e) => e.type === EMdStyleTagType.ITALIC);
    expect(boldIndex).toBeLessThan(italicIndex);
  });
});

// ── HTML equivalents of MD tags ──────────────────────────────────────────────

describe('HTML_EQUIV_MD_TAG_REGEX', () => {
  it('covers BOLD, ITALIC, STRIKETHROUGH', () => {
    const covered = new Set(HTML_EQUIV_MD_TAG_REGEX.map((e) => e.type));
    expect(covered.has(EMdStyleTagType.BOLD)).toBe(true);
    expect(covered.has(EMdStyleTagType.ITALIC)).toBe(true);
    expect(covered.has(EMdStyleTagType.STRIKETHROUGH)).toBe(true);
  });

  it('BOLD open matches <b> but not <br> or <body>', () => {
    const entry = HTML_EQUIV_MD_TAG_REGEX.find((e) => e.type === EMdStyleTagType.BOLD)!;
    expect(entry.open.test('<b>')).toBe(true);
    expect(entry.open.test('<br>')).toBe(false);
    expect(entry.close.test('</b>')).toBe(true);
    expect(entry.close.test('</br>')).toBe(false);
  });

  it('ITALIC open matches <i> but not <input>', () => {
    const entry = HTML_EQUIV_MD_TAG_REGEX.find((e) => e.type === EMdStyleTagType.ITALIC)!;
    expect(entry.open.test('<i>')).toBe(true);
    expect(entry.open.test('<input>')).toBe(false);
    expect(entry.close.test('</i>')).toBe(true);
  });

  it('STRIKETHROUGH open matches <s> but not <span>', () => {
    const entry = HTML_EQUIV_MD_TAG_REGEX.find((e) => e.type === EMdStyleTagType.STRIKETHROUGH)!;
    expect(entry.open.test('<s>')).toBe(true);
    expect(entry.open.test('<span>')).toBe(false);
    expect(entry.close.test('</s>')).toBe(true);
  });
});

// ── HTML-only style tags ─────────────────────────────────────────────────────

describe('HTML_TAG_REGEX', () => {
  it('covers all EHtmlStyleTagType values', () => {
    const covered = new Set(HTML_TAG_REGEX.map((e) => e.type));
    const allTypes = Object.values(EHtmlStyleTagType);
    expect([...covered].sort()).toEqual(allTypes.sort());
  });

  it('UNDERLINE open/close match <u> and </u>', () => {
    const entry = HTML_TAG_REGEX.find((e) => e.type === EHtmlStyleTagType.UNDERLINE)!;
    expect(entry.open.test('<u>')).toBe(true);
    expect(entry.close.test('</u>')).toBe(true);
    expect(entry.open.test('<ul>')).toBe(false);
  });

  it('SUBSCRIPT open/close match <sub> and </sub>', () => {
    const entry = HTML_TAG_REGEX.find((e) => e.type === EHtmlStyleTagType.SUBSCRIPT)!;
    expect(entry.open.test('<sub>')).toBe(true);
    expect(entry.close.test('</sub>')).toBe(true);
    expect(entry.open.test('<sup>')).toBe(false);
  });

  it('SUPERSCRIPT open/close match <sup> and </sup>', () => {
    const entry = HTML_TAG_REGEX.find((e) => e.type === EHtmlStyleTagType.SUPERSCRIPT)!;
    expect(entry.open.test('<sup>')).toBe(true);
    expect(entry.close.test('</sup>')).toBe(true);
    expect(entry.open.test('<sub>')).toBe(false);
  });
});

// ── Span style tags ──────────────────────────────────────────────────────────

describe('SPAN_TAG_REGEX', () => {
  it('covers all ESpanStyleTagType values', () => {
    const covered = new Set(SPAN_TAG_REGEX.map((e) => e.type));
    const allTypes = Object.values(ESpanStyleTagType);
    expect([...covered].sort()).toEqual(allTypes.sort());
  });

  it('ALIGN appears before COLOR to prevent premature single-property match', () => {
    const alignIndex = SPAN_TAG_REGEX.findIndex((e) => e.type === ESpanStyleTagType.ALIGN);
    const colorIndex = SPAN_TAG_REGEX.findIndex((e) => e.type === ESpanStyleTagType.COLOR);
    expect(alignIndex).toBeLessThan(colorIndex);
  });

  it('COLOR open matches <span style="color:red"> and captures style value', () => {
    const entry = SPAN_TAG_REGEX.find((e) => e.type === ESpanStyleTagType.COLOR)!;
    const match = entry.open.exec('<span style="color:red">');
    expect(match).not.toBeNull();
    expect(match![1]).toContain('color:red');
    expect(entry.close.test('</span>')).toBe(true);
  });

  it('COLOR open does not match <span style="font-size:12pt">', () => {
    const entry = SPAN_TAG_REGEX.find((e) => e.type === ESpanStyleTagType.COLOR)!;
    expect(entry.open.test('<span style="font-size:12pt">')).toBe(false);
  });

  it('FONT_SIZE open matches <span style="font-size:14pt">', () => {
    const entry = SPAN_TAG_REGEX.find((e) => e.type === ESpanStyleTagType.FONT_SIZE)!;
    const match = entry.open.exec('<span style="font-size:14pt">');
    expect(match).not.toBeNull();
    expect(match![1]).toContain('font-size:14pt');
  });

  it('FONT_FAMILY open matches <span style="font-family:Arial">', () => {
    const entry = SPAN_TAG_REGEX.find((e) => e.type === ESpanStyleTagType.FONT_FAMILY)!;
    const match = entry.open.exec('<span style="font-family:Arial">');
    expect(match).not.toBeNull();
    expect(match![1]).toContain('font-family:Arial');
  });

  it('HIGHLIGHT open matches <span style="background:#ffff00">', () => {
    const entry = SPAN_TAG_REGEX.find((e) => e.type === ESpanStyleTagType.HIGHLIGHT)!;
    const match = entry.open.exec('<span style="background:#ffff00">');
    expect(match).not.toBeNull();
    expect(match![1]).toContain('background:#ffff00');
  });

  it('ALIGN open matches multi-property align span', () => {
    const entry = SPAN_TAG_REGEX.find((e) => e.type === ESpanStyleTagType.ALIGN)!;
    const alignSpan = '<span style="display:inline-block;width:100%;text-align:center">';
    const match = entry.open.exec(alignSpan);
    expect(match).not.toBeNull();
    expect(match![1]).toContain('text-align:center');
  });

  it('all span entries use </span> as close', () => {
    for (const entry of SPAN_TAG_REGEX) {
      expect(entry.close.test('</span>')).toBe(true);
    }
  });
});

// ── Line-level prefix tags ───────────────────────────────────────────────────

describe('LINE_TAG_REGEX', () => {
  it('covers all ELineTagType values', () => {
    const covered = new Set(LINE_TAG_REGEX.map((e) => e.type));
    const allTypes = Object.values(ELineTagType);
    expect([...covered].sort()).toEqual(allTypes.sort());
  });

  it('CALLOUT appears before QUOTE in registry order', () => {
    const calloutIndex = LINE_TAG_REGEX.findIndex((e) => e.type === ELineTagType.CALLOUT);
    const quoteIndex = LINE_TAG_REGEX.findIndex((e) => e.type === ELineTagType.QUOTE);
    expect(calloutIndex).toBeLessThan(quoteIndex);
  });

  it('CHECKBOX appears before LIST in registry order', () => {
    const checkboxIndex = LINE_TAG_REGEX.findIndex((e) => e.type === ELineTagType.CHECKBOX);
    const listIndex = LINE_TAG_REGEX.findIndex((e) => e.type === ELineTagType.LIST);
    expect(checkboxIndex).toBeLessThan(listIndex);
  });

  it('LIST open matches `- item` but not `- [ ] item`', () => {
    const entry = LINE_TAG_REGEX.find((e) => e.type === ELineTagType.LIST)!;
    expect(entry.open.test('- item')).toBe(true);
    expect(entry.open.test('- [ ] item')).toBe(false);
  });

  it('CHECKBOX open matches `- [ ] item`', () => {
    const entry = LINE_TAG_REGEX.find((e) => e.type === ELineTagType.CHECKBOX)!;
    expect(entry.open.test('- [ ] item')).toBe(true);
    expect(entry.open.test('- item')).toBe(false);
  });

  it('HEADING open matches `# title` through `###### title`', () => {
    const entry = LINE_TAG_REGEX.find((e) => e.type === ELineTagType.HEADING)!;
    expect(entry.open.test('# title')).toBe(true);
    expect(entry.open.test('### title')).toBe(true);
    expect(entry.open.test('###### title')).toBe(true);
    expect(entry.open.test('####### title')).toBe(false);
    expect(entry.open.test('#title')).toBe(false);
  });

  it('QUOTE open matches `> text` but not `> [!note]` callout', () => {
    const entry = LINE_TAG_REGEX.find((e) => e.type === ELineTagType.QUOTE)!;
    expect(entry.open.test('> text')).toBe(true);
    expect(entry.open.test('> [!note] callout')).toBe(false);
  });

  it('CALLOUT open matches `> [!type]` with optional multiple `>`', () => {
    const entry = LINE_TAG_REGEX.find((e) => e.type === ELineTagType.CALLOUT)!;
    expect(entry.open.test('> [!note] Title')).toBe(true);
    expect(entry.open.test('>> [!warning]')).toBe(true);
    expect(entry.open.test('> text')).toBe(false);
  });

  it('INDENT open matches margin-left self-closing span at column 0', () => {
    const entry = LINE_TAG_REGEX.find((e) => e.type === ELineTagType.INDENT)!;
    expect(entry.open.test('<span style="margin-left:24px"/>')).toBe(true);
    expect(entry.open.test('<span style="margin-left:48px"/>')).toBe(true);
    // Must be at column 0.
    expect(entry.open.test('  <span style="margin-left:24px"/>')).toBe(false);
  });

  it('INDENT open captures pixel value in group 1', () => {
    const entry = LINE_TAG_REGEX.find((e) => e.type === ELineTagType.INDENT)!;
    const match = entry.open.exec('<span style="margin-left:48px"/>');
    expect(match).not.toBeNull();
    expect(match![1]).toBe('48');
  });
});

// ── Special / protected-range tags ──────────────────────────────────────────

describe('SPECIAL_TAG_REGEX', () => {
  it('EMBED appears before WIKILINK in registry order', () => {
    const embedIndex = SPECIAL_TAG_REGEX.findIndex((e) => e.type === ESpecialTagType.EMBED);
    const wikilinkIndex = SPECIAL_TAG_REGEX.findIndex((e) => e.type === ESpecialTagType.WIKILINK);
    expect(embedIndex).toBeLessThan(wikilinkIndex);
  });

  it('fenced CODE open matches ``` at line start with optional language', () => {
    const fencedEntry = SPECIAL_TAG_REGEX.find(
      (e) => e.type === ESpecialTagType.CODE && e.open.source.startsWith('^```'),
    )!;
    expect(fencedEntry.open.test('```typescript')).toBe(true);
    expect(fencedEntry.open.test('```')).toBe(true);
    expect(fencedEntry.close!.test('```')).toBe(true);
    expect(fencedEntry.close!.test('  ```  ')).toBe(true);
  });

  it('inline CODE open and close match single backtick', () => {
    const inlineEntry = SPECIAL_TAG_REGEX.find(
      (e) => e.type === ESpecialTagType.CODE && e.open.source === '`',
    )!;
    expect(inlineEntry.open.test('`code`')).toBe(true);
    expect(inlineEntry.close!.test('`')).toBe(true);
  });

  it('INLINE_TODO open matches #todo bounded by word boundary', () => {
    const entry = SPECIAL_TAG_REGEX.find((e) => e.type === ESpecialTagType.INLINE_TODO)!;
    expect(entry.open.test('#todo')).toBe(true);
    expect(entry.open.test(' #todo')).toBe(true);
    expect(entry.close).toBeNull();
  });

  it('MEETING_DETAILS open matches `> ---` line', () => {
    const entry = SPECIAL_TAG_REGEX.find((e) => e.type === ESpecialTagType.MEETING_DETAILS)!;
    expect(entry.open.test('> ---')).toBe(true);
    // `\s*` is intentionally lenient — matches `>---` with no space (consistent with MEETING_DETAILS_OPENING_PATTERN).
    expect(entry.open.test('>---')).toBe(true);
    expect(entry.open.test('> text')).toBe(false);
    expect(entry.close).not.toBeNull();
  });

  it('EMBED open matches full ![[...]] token', () => {
    const entry = SPECIAL_TAG_REGEX.find((e) => e.type === ESpecialTagType.EMBED)!;
    const match = entry.open.exec('![[image.png]]');
    expect(match).not.toBeNull();
    expect(match![1]).toBe('image.png');
    expect(entry.close).toBeNull();
  });

  it('WIKILINK open matches [[...]] but not ![[...]]', () => {
    const entry = SPECIAL_TAG_REGEX.find((e) => e.type === ESpecialTagType.WIKILINK)!;
    const match = entry.open.exec('[[Note Title]]');
    expect(match).not.toBeNull();
    expect(match![1]).toBe('Note Title');
    expect(entry.close).toBeNull();
  });

  it('MD_LINK open matches [text](url) and captures text and url', () => {
    const entry = SPECIAL_TAG_REGEX.find((e) => e.type === ESpecialTagType.MD_LINK)!;
    const match = entry.open.exec('[click here](https://example.com)');
    expect(match).not.toBeNull();
    expect(match![1]).toBe('click here');
    expect(match![2]).toBe('https://example.com');
    expect(entry.close).toBeNull();
  });

  it('FOOTNOTE_REF open matches [^id] and captures id', () => {
    const entry = SPECIAL_TAG_REGEX.find((e) => e.type === ESpecialTagType.FOOTNOTE_REF)!;
    const match = entry.open.exec('[^note1]');
    expect(match).not.toBeNull();
    expect(match![1]).toBe('note1');
    expect(entry.close).toBeNull();
  });
});
