import { buildTagContext } from './DetectionEngine';

// All tests in TDD red state — stubs throw 'not implemented'.

// ─── MD closing tags ──────────────────────────────────────────────────────────

describe('buildTagContext — MD closing tags', () => {
  // input, type, openStart, openEnd, closeStart, closeEnd
  it.each<[string, string, number, number, number, number]>([
    ['**hello**',  'bold',          0, 2, 7, 9],
    ['*hello*',    'italic',        0, 1, 6, 7],
    ['~~hello~~',  'strikethrough', 0, 2, 7, 9],
    ['==hello==',  'highlight',     0, 2, 7, 9],
    ['`hello`',    'code',          0, 1, 6, 7],
  ])('%s → %s', (input, type, openStart, openEnd, closeStart, closeEnd) => {
    const { tags } = buildTagContext(input);
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({ type, isHTML: false, isSpan: false });
    expect(tags[0].open).toEqual({ start: { line: 0, ch: openStart }, end: { line: 0, ch: openEnd } });
    expect(tags[0].close).toEqual({ start: { line: 0, ch: closeStart }, end: { line: 0, ch: closeEnd } });
  });
});

// ─── HTML closing tags ────────────────────────────────────────────────────────

describe('buildTagContext — HTML closing tags', () => {
  it.each([
    ['<b>hi</b>',    'bold'],
    ['<i>hi</i>',    'italic'],
    ['<s>hi</s>',    'strikethrough'],
    ['<u>hi</u>',    'underline'],
    ['<sub>x</sub>', 'subscript'],
    ['<sup>x</sup>', 'superscript'],
  ])('%s → %s', (input, type) => {
    const { tags } = buildTagContext(input);
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({ type, isHTML: true, isSpan: false });
  });

  it('<b>hi</b> has open ch:0..3 and close ch:5..9', () => {
    const { tags } = buildTagContext('<b>hi</b>');
    expect(tags[0].open).toEqual({ start: { line: 0, ch: 0 }, end: { line: 0, ch: 3 } });
    expect(tags[0].close).toEqual({ start: { line: 0, ch: 5 }, end: { line: 0, ch: 9 } });
  });
});

// ─── HTML span tags ───────────────────────────────────────────────────────────

describe('buildTagContext — HTML span tags', () => {
  it.each([
    ['<span style="color:red">hi</span>',           'color'],
    ['<span style="font-size:14pt">hi</span>',       'fontSize'],
    ['<span style="background:#ffff00">hi</span>',   'highlight'],
    ['<span style="font-family:Arial">hi</span>',    'fontFamily'],
    ['<span style="display:inline-block;width:100%;text-align:center">hi</span>', 'align'],
  ])('%s → %s span', (input, type) => {
    const { tags } = buildTagContext(input);
    expect(tags[0]).toMatchObject({ type, isHTML: true, isSpan: true });
  });
});

// ─── Line-level tags ──────────────────────────────────────────────────────────

describe('buildTagContext — line-level tags', () => {
  it.each([
    ['- item',                              'list'],
    ['# Title',                             'heading'],
    ['## Title',                            'heading'],
    ['### Title',                           'heading'],
    ['#### Title',                          'heading'],
    ['##### Title',                         'heading'],
    ['###### Title',                        'heading'],
    ['> note',                              'quote'],
    ['- [ ] task',                          'checkbox'],
    ['> [!note] My Note',                   'callout'],
    ['> ---',                               'meetingDetails'],
    ['<span style="margin-left:24px"/>item', 'indent'],
  ])('%s → %s', (input, type) => {
    const { tags } = buildTagContext(input);
    const tag = tags.find((t) => t.type === type);
    expect(tag).toBeDefined();
    expect(tag!.close).toBeUndefined();
  });
});

// ─── Inert zones ──────────────────────────────────────────────────────────────

describe('buildTagContext — inert zones', () => {
  it.each([
    ['```\n**bold**\n```', 'fenced code'],
    ['$$\n**bold**\n$$',   'math block'],
    ['\t**bold**',         'tab-indented'],
  ])('no bold tag inside %s', (input) => {
    expect(buildTagContext(input).tags.filter((t) => t.type === 'bold')).toHaveLength(0);
  });

  it('detects bold before and after fenced code block (2 tags)', () => {
    const { tags } = buildTagContext('**before**\n```\ncontent\n```\n**after**');
    expect(tags.filter((t) => t.type === 'bold')).toHaveLength(2);
  });
});

// ─── Protected ranges ─────────────────────────────────────────────────────────

describe('buildTagContext — protected ranges', () => {
  it.each([
    ['[[Page]]',              'wikilink'],
    ['![[img.png]]',          'embed'],
    ['[text](https://x.com)', 'mdLink'],
    ['[^ref]',                'footnoteRef'],
    ['`hello`',               'code'],
    ['#todo buy milk',        'todo'],
    ['> ---',                 'meetingDetails'],
  ])('%s → protected range tokenType=%s', (input, tokenType) => {
    const { protectedRanges } = buildTagContext(input);
    expect(protectedRanges[0].tokenType).toBe(tokenType);
  });
});

// ─── Edge cases ──────────────────────────────────────────────────────────────
describe('buildTagContext — edge cases', () => {
  it('content field holds original string', () => {
    expect(buildTagContext('hello world').content).toBe('hello world');
  });

  it('detects #todo as inlineTodo tag', () => {
    expect(buildTagContext('buy #todo milk').tags.find((t) => t.type === 'inlineTodo')).toBeDefined();
  });

  it.each([['**unclosed text'], ['hello**']])('unmatched delimiter %s discarded', (input) => {
    expect(buildTagContext(input as string).tags.filter((t) => t.type === 'bold')).toHaveLength(0);
  });

  it('inline tag inside code span is suppressed', () => {
    expect(buildTagContext('`**bold** inside code`').tags.filter((t) => t.type === 'bold')).toHaveLength(0);
  });

  it('tags ordered by open.start ascending', () => {
    const { tags } = buildTagContext('**bold** and *italic*');
    expect(tags[0].type).toBe('bold');
    expect(tags[1].type).toBe('italic');
  });

  it('> [!note] callout line produces no quote tag', () => {
    expect(buildTagContext('> [!note] My Note').tags.filter((t) => t.type === 'quote')).toHaveLength(0);
  });

  it('list tag has open defined at line start', () => {
    const tag = buildTagContext('- item').tags.find((t) => t.type === 'list')!;
    expect(tag.open).toEqual({ start: { line: 0, ch: 0 }, end: { line: 0, ch: 2 } });
  });

  it('meetingDetails has open===undefined and close===undefined', () => {
    const tag = buildTagContext('> ---').tags.find((t) => t.type === 'meetingDetails')!;
    expect(tag.open).toBeUndefined();
    expect(tag.close).toBeUndefined();
  });

  it('inlineTodo tag has no close offset', () => {
    const tag = buildTagContext('buy #todo milk').tags.find((t) => t.type === 'inlineTodo')!;
    expect(tag.close).toBeUndefined();
  });
});
