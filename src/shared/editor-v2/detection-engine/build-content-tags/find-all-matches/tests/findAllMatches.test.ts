import { EMdStyleTagType, ELineTagType, ESpecialTagType } from '../../../../interfaces';
import type { TMatchRecord } from '../../interfaces';
import { findAllMatches as findAllMatchesRaw } from '../findAllMatches';

// Cast to TMatchRecord[] for ergonomic property access in tests.
const findAllMatches = (content: string): TMatchRecord[] => findAllMatchesRaw(content) as TMatchRecord[];

/** Finds the first match of a given type with an open position. */
const findOpen = (matches: TMatchRecord[], type: TMatchRecord['type']) =>
  matches.find((match) => match.type === type && match.open);

/** Finds the first match of a given type with a close position. */
const findClose = (matches: TMatchRecord[], type: TMatchRecord['type']) =>
  matches.find((match) => match.type === type && match.close);

describe('findAllMatches', () => {
  describe('open records without titleRegex', () => {
    test('bold open is detected with correct position and no title', () => {
      const matches = findAllMatches('**bold**');
      const boldOpen = findOpen(matches, EMdStyleTagType.BOLD);

      expect(boldOpen).not.toBeUndefined();
      expect(boldOpen?.open?.start).toEqual({ line: 0, ch: 0 });
      expect(boldOpen?.open?.end).toEqual({ line: 0, ch: 2 });
      expect(boldOpen?.title).toBeUndefined();
    });

    test('bold close records are detected at all ** positions with no title', () => {
      // Both ** occurrences produce close records (matchMdTags will pair them later).
      const matches = findAllMatches('**bold**');
      const boldCloses = matches.filter((m) => m.type === EMdStyleTagType.BOLD && m.close);

      expect(boldCloses.length).toBeGreaterThan(0);
      // The second ** (at ch:6) must be among the close records.
      const closeAt6 = boldCloses.find((m) => m.close?.start.ch === 6);
      expect(closeAt6).not.toBeUndefined();
      expect(closeAt6?.close?.end).toEqual({ line: 0, ch: 8 });
      expect(closeAt6?.title).toBeUndefined();
    });
  });

  describe('open records with titleRegex', () => {
    test('heading open carries title when text follows the prefix', () => {
      const matches = findAllMatches('# Hello');
      const heading = findOpen(matches, ELineTagType.HEADING);

      expect(heading).not.toBeUndefined();
      expect(heading?.title).toEqual(['Hello']);
    });

    test('heading open has no title when nothing follows the prefix', () => {
      // `# ` (trailing space, no text) — titleRegex captures nothing.
      const matches = findAllMatches('# ');
      const heading = findOpen(matches, ELineTagType.HEADING);

      expect(heading).not.toBeUndefined();
      expect(heading?.title).toBeUndefined();
    });

    test('extractTitle uses text up to first newline when content is multi-line', () => {
      const matches = findAllMatches('# Hello\nnext line');
      const heading = findOpen(matches, ELineTagType.HEADING);

      // Title should only contain the text on the heading line, not "next line".
      expect(heading?.title).toEqual(['Hello']);
    });

    test('extractTitle uses rest of content when there is no newline', () => {
      const matches = findAllMatches('# SingleLine');
      const heading = findOpen(matches, ELineTagType.HEADING);

      expect(heading?.title).toEqual(['SingleLine']);
    });
  });

  describe('CALLOUT title extraction', () => {
    test('falls back to callout type when no custom title follows [!type]', () => {
      const matches = findAllMatches('> [!note]');
      const callout = findOpen(matches, ELineTagType.CALLOUT);

      expect(callout).not.toBeUndefined();
      expect(callout?.title).toEqual(['note']);
    });

    test('uses custom title when text follows [!type]', () => {
      const matches = findAllMatches('> [!warning] My Warning Title');
      const callout = findOpen(matches, ELineTagType.CALLOUT);

      expect(callout).not.toBeUndefined();
      expect(callout?.title).toEqual(['My Warning Title']);
    });

    test('extractCalloutType reads to end of string when content has no newline', () => {
      const matches = findAllMatches('> [!tip]');
      const callout = findOpen(matches, ELineTagType.CALLOUT);

      expect(callout?.title).toEqual(['tip']);
    });

    test('extractCalloutType reads only up to newline in multi-line content', () => {
      const matches = findAllMatches('> [!tip]\ncontinuation');
      const callout = findOpen(matches, ELineTagType.CALLOUT);

      // Title should come from the first line only.
      expect(callout?.title).toEqual(['tip']);
    });
  });

  describe('close records', () => {
    test('footnote close record at line start includes title from titleRegex', () => {
      const matches = findAllMatches('[^foot1]:');
      const footnoteClose = findClose(matches, ESpecialTagType.FOOTNOTE_REF);

      expect(footnoteClose).not.toBeUndefined();
      expect(footnoteClose?.close?.start).toEqual({ line: 0, ch: 0 });
      expect(footnoteClose?.title).toEqual(['foot1']);
    });

    test('atomic token (LINE_CODE) produces no close record', () => {
      const matches = findAllMatches('\tcode at start');
      const lineCodeClose = findClose(matches, ESpecialTagType.LINE_CODE);

      expect(lineCodeClose).toBeUndefined();
    });
  });

  describe('position computation', () => {
    test('positions on the second line are assigned the correct line number', () => {
      const matches = findAllMatches('first line\n**bold**');
      const boldOpen = findOpen(matches, EMdStyleTagType.BOLD);

      expect(boldOpen?.open?.start.line).toBe(1);
      expect(boldOpen?.open?.start.ch).toBe(0);
    });

    test('results are sorted ascending by document position', () => {
      const matches = findAllMatches('**a** **b**');
      const positions = matches.map((match) => (match.open ?? match.close)!.start);

      for (let index = 1; index < positions.length; index++) {
        const previous = positions[index - 1];
        const current = positions[index];
        const isOrdered =
          previous.line < current.line ||
          (previous.line === current.line && previous.ch <= current.ch);
        expect(isOrdered).toBe(true);
      }
    });
  });
});
