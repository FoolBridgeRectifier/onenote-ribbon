import { describe, it, expect } from 'vitest';
import { detectCodeTag } from './detectCodeTag';

describe('detectCodeTag', () => {
  it('returns null when no code tags found', () => {
    const lines = ['regular text', 'more text'];
    const cursor = { line: 0, ch: 0 };
    expect(detectCodeTag(lines, cursor)).toBeNull();
  });

  it('detects tab code block before cursor', () => {
    const lines = ['', '\tcode content'];
    const cursor = { line: 1, ch: 0 };
    expect(detectCodeTag(lines, cursor)).toBeNull();
  });

  it('detects space code block', () => {
    const lines = ['', '    code content'];
    const cursor = { line: 1, ch: 0 };
    expect(detectCodeTag(lines, cursor)).toBeNull();
  });

  it('detects multi-line code block with triple backticks', () => {
    const lines = ['```', 'code', '```'];
    const cursor = { line: 1, ch: 0 };
    expect(detectCodeTag(lines, cursor)).toBeNull();
  });

  it('detects single line backtick code', () => {
    const lines = ['text `code` more'];
    const cursor = { line: 0, ch: 5 };
    expect(detectCodeTag(lines, cursor)).toBeNull();
  });
});
