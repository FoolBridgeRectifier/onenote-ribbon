import { buildTagContext } from './DetectionEngine';
import type { DetectedTag, TagContext } from './interfaces';

// All tests are in TDD red state — stubs throw 'not implemented'.
// Once implemented, each test must pass exactly as written.

describe('buildTagContext — MD closing tags', () => {
  it('detects bold MD tag: **hello**', () => {
    const context: TagContext = buildTagContext('**hello**');
    expect(context.tags).toHaveLength(1);
    const tag: DetectedTag = context.tags[0];
    expect(tag.type).toBe('bold');
    expect(tag.isHTML).toBe(false);
    expect(tag.isSpan).toBe(false);
    expect(tag.open).toEqual({ start: { line: 0, ch: 0 }, end: { line: 0, ch: 2 } });
    expect(tag.close).toEqual({ start: { line: 0, ch: 7 }, end: { line: 0, ch: 9 } });
  });

  it('detects italic MD tag: *hello*', () => {
    const context: TagContext = buildTagContext('*hello*');
    expect(context.tags).toHaveLength(1);
    expect(context.tags[0].type).toBe('italic');
    expect(context.tags[0].open).toEqual({ start: { line: 0, ch: 0 }, end: { line: 0, ch: 1 } });
    expect(context.tags[0].close).toEqual({ start: { line: 0, ch: 6 }, end: { line: 0, ch: 7 } });
  });

  it('detects strikethrough MD tag: ~~hello~~', () => {
    const context: TagContext = buildTagContext('~~hello~~');
    expect(context.tags).toHaveLength(1);
    expect(context.tags[0].type).toBe('strikethrough');
  });

  it('detects highlight MD tag: ==hello==', () => {
    const context: TagContext = buildTagContext('==hello==');
    expect(context.tags).toHaveLength(1);
    expect(context.tags[0].type).toBe('highlight');
  });

  it('detects code MD tag: `hello`', () => {
    const context: TagContext = buildTagContext('`hello`');
    expect(context.tags).toHaveLength(1);
    expect(context.tags[0].type).toBe('code');
  });
});

describe('buildTagContext — HTML closing tags', () => {
  it('detects HTML bold: <b>hi</b>', () => {
    const context: TagContext = buildTagContext('<b>hi</b>');
    expect(context.tags).toHaveLength(1);
    const tag = context.tags[0];
    expect(tag.type).toBe('bold');
    expect(tag.isHTML).toBe(true);
    expect(tag.isSpan).toBe(false);
  });

  it('detects HTML underline: <u>hi</u>', () => {
    const context: TagContext = buildTagContext('<u>hi</u>');
    expect(context.tags[0].type).toBe('underline');
    expect(context.tags[0].isHTML).toBe(true);
  });

  it('detects HTML subscript: <sub>x</sub>', () => {
    const context: TagContext = buildTagContext('<sub>x</sub>');
    expect(context.tags[0].type).toBe('subscript');
  });

  it('detects HTML superscript: <sup>x</sup>', () => {
    const context: TagContext = buildTagContext('<sup>x</sup>');
    expect(context.tags[0].type).toBe('superscript');
  });
});

describe('buildTagContext — HTML span tags', () => {
  it('detects color span', () => {
    const context: TagContext = buildTagContext('<span style="color:red">hi</span>');
    expect(context.tags[0].type).toBe('color');
    expect(context.tags[0].isSpan).toBe(true);
  });

  it('detects font-size span', () => {
    const context: TagContext = buildTagContext('<span style="font-size:14pt">hi</span>');
    expect(context.tags[0].type).toBe('fontSize');
  });
});

describe('buildTagContext — line-level tags', () => {
  it('detects list item line tag', () => {
    const context: TagContext = buildTagContext('- item');
    const lineTag = context.tags.find((tag) => tag.type === 'list');
    expect(lineTag).toBeDefined();
    expect(lineTag!.close).toBeUndefined();
  });

  it('detects h1 heading line tag', () => {
    const context: TagContext = buildTagContext('# Title');
    const headingTag = context.tags.find((tag) => tag.type === 'heading');
    expect(headingTag).toBeDefined();
    expect(headingTag!.headingLevel).toBe(1);
  });

  it('detects h2 heading level', () => {
    const context: TagContext = buildTagContext('## Title');
    const headingTag = context.tags.find((tag) => tag.type === 'heading');
    expect(headingTag!.headingLevel).toBe(2);
  });

  it('detects quote line tag', () => {
    const context: TagContext = buildTagContext('> note');
    expect(context.tags.find((tag) => tag.type === 'quote')).toBeDefined();
  });

  it('detects callout line tag with calloutType', () => {
    const context: TagContext = buildTagContext('> [!note] My Note');
    const calloutTag = context.tags.find((tag) => tag.type === 'callout');
    expect(calloutTag).toBeDefined();
    expect(calloutTag!.calloutType).toBe('note');
  });

  it('detects checkbox line tag', () => {
    const context: TagContext = buildTagContext('- [ ] task');
    expect(context.tags.find((tag) => tag.type === 'checkbox')).toBeDefined();
  });

  it('detects indent span with depth 1', () => {
    const context: TagContext = buildTagContext('<span style="margin-left:24px"/>item');
    const indentTag = context.tags.find((tag) => tag.type === 'indent');
    expect(indentTag).toBeDefined();
    expect(indentTag!.indentDepth).toBe(1);
  });

  it('detects indent span with depth 2', () => {
    const context: TagContext = buildTagContext('<span style="margin-left:48px"/>item');
    const indentTag = context.tags.find((tag) => tag.type === 'indent');
    expect(indentTag!.indentDepth).toBe(2);
  });
});

describe('buildTagContext — inert zones', () => {
  it('skips tags inside fenced code block', () => {
    const content = '```\n**bold**\n```';
    const context: TagContext = buildTagContext(content);
    expect(context.tags.filter((tag) => tag.type === 'bold')).toHaveLength(0);
  });

  it('scans tags before and after fenced code block', () => {
    const content = '**before**\n```\ncontent\n```\n**after**';
    const context: TagContext = buildTagContext(content);
    expect(context.tags.filter((tag) => tag.type === 'bold')).toHaveLength(2);
  });
});

describe('buildTagContext — protected ranges', () => {
  it('records wikilink as protected range, not as tag', () => {
    const context: TagContext = buildTagContext('text [[My Page]] more');
    expect(context.protectedRanges).toHaveLength(1);
    expect(context.protectedRanges[0].tokenType).toBe('wikilink');
  });

  it('orders tags by open.start ascending for two tags on same line', () => {
    const context: TagContext = buildTagContext('**bold** and *italic*');
    expect(context.tags[0].type).toBe('bold');
    expect(context.tags[1].type).toBe('italic');
  });
});
