import { MD_TAG_REGEX } from '../md';
import { EMdStyleTagType } from '../../../../../interfaces';

describe('MD_TAG_REGEX', () => {
  const boldEntry = MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.BOLD)!;
  const italicEntry = MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.ITALIC)!;
  const strikethroughEntry = MD_TAG_REGEX.find(
    (entry) => entry.type === EMdStyleTagType.STRIKETHROUGH
  )!;
  const highlightEntry = MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.HIGHLIGHT)!;

  const extractFirstMatch = (inputText: string, regexPattern: RegExp): string | null =>
    inputText.match(regexPattern)?.[0] ?? null;

  const assertMatchesAgainstExpected = (
    inputText: string,
    regexPattern: RegExp,
    expectedMatches: string[]
  ) => {
    const firstMatch = extractFirstMatch(inputText, regexPattern);
    const matches = firstMatch === null ? [] : [firstMatch];

    expect(matches).toHaveLength(expectedMatches.length);

    expectedMatches.forEach((expectedString, index) => {
      expect(matches[index]).toBe(expectedString);
    });
  };

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

  describe('BOLD open', () => {
    test.each`
      inputText     | expectedMatches
      ${'**text**'} | ${['**']}
    `(
      'returns expected open string for $inputText',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, boldEntry.open, expectedMatches);
      }
    );

    test('returns null when open is missing', () => {
      const expectedMatches: string[] = [];
      assertMatchesAgainstExpected('*text*', boldEntry.open, expectedMatches);
    });
  });

  describe('ITALIC open', () => {
    test.each`
      inputText     | expectedMatches
      ${'*text*'}   | ${['*']}
      ${'**text**'} | ${['*']}
    `(
      'returns expected open string for $inputText',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, italicEntry.open, expectedMatches);
      }
    );
  });

  describe('STRIKETHROUGH open', () => {
    test.each`
      inputText     | expectedMatches
      ${'~~text~~'} | ${['~~']}
    `(
      'returns expected open string for $inputText',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, strikethroughEntry.open, expectedMatches);
      }
    );

    test('returns null when open is missing', () => {
      const expectedMatches: string[] = [];
      assertMatchesAgainstExpected('~text~', strikethroughEntry.open, expectedMatches);
    });
  });

  describe('HIGHLIGHT open', () => {
    test.each`
      inputText     | expectedMatches
      ${'==text=='} | ${['==']}
    `(
      'returns expected open string for $inputText',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, highlightEntry.open, expectedMatches);
      }
    );

    test('returns null when open is missing', () => {
      const expectedMatches: string[] = [];
      assertMatchesAgainstExpected('=text=', highlightEntry.open, expectedMatches);
    });
  });
});
