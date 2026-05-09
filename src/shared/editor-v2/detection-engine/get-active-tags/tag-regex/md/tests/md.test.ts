import { MD_TAG_REGEX } from '../md';
import { EMdStyleTagType } from '../../../../../interfaces';
import { assertMatches } from '../../tests/testUtils';

describe('MD_TAG_REGEX', () => {
  const boldEntry = MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.BOLD)!;
  const italicEntry = MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.ITALIC)!;
  const strikethroughEntry = MD_TAG_REGEX.find(
    (entry) => entry.type === EMdStyleTagType.STRIKETHROUGH
  )!;
  const highlightEntry = MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.HIGHLIGHT)!;

  describe('shape', () => {
    test('contains exactly 4 entries', () => {
      expect(MD_TAG_REGEX).toHaveLength(4);
    });
  });

  describe('ordering', () => {
    test('BOLD appears before ITALIC so ** is tried first', () => {
      const boldIndex = MD_TAG_REGEX.findIndex((entry) => entry.type === EMdStyleTagType.BOLD);
      const italicIndex = MD_TAG_REGEX.findIndex((entry) => entry.type === EMdStyleTagType.ITALIC);
      expect(boldIndex).toBeLessThan(italicIndex);
    });
  });

  describe('BOLD', () => {
    test.each`
      content       | expectedMatches
      ${'**text**'} | ${['**']}
      ${'*text*'}   | ${[]}
    `('open matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, boldEntry.open, expectedMatches);
    });
  });

  describe('ITALIC', () => {
    test.each`
      content       | expectedMatches
      ${'*text*'}   | ${['*']}
      ${'**text**'} | ${['*']}
    `('open matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, italicEntry.open, expectedMatches);
    });
  });

  describe('STRIKETHROUGH', () => {
    test.each`
      content       | expectedMatches
      ${'~~text~~'} | ${['~~']}
      ${'~text~'}   | ${[]}
    `('open matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, strikethroughEntry.open, expectedMatches);
    });
  });

  describe('HIGHLIGHT', () => {
    test.each`
      content       | expectedMatches
      ${'==text=='} | ${['==']}
      ${'=text='}   | ${[]}
    `('open matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, highlightEntry.open, expectedMatches);
    });
  });
});
