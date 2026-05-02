import { SPAN_TAG_REGEX } from '../span';
import { ESpanStyleTagType } from '../../../../../interfaces';

describe('SPAN_TAG_REGEX', () => {
  const alignEntry = SPAN_TAG_REGEX.find((entry) => entry.type === ESpanStyleTagType.ALIGN)!;
  const colorEntry = SPAN_TAG_REGEX.find((entry) => entry.type === ESpanStyleTagType.COLOR)!;
  const fontSizeEntry = SPAN_TAG_REGEX.find((entry) => entry.type === ESpanStyleTagType.FONT_SIZE)!;
  const fontFamilyEntry = SPAN_TAG_REGEX.find(
    (entry) => entry.type === ESpanStyleTagType.FONT_FAMILY
  )!;
  const highlightEntry = SPAN_TAG_REGEX.find(
    (entry) => entry.type === ESpanStyleTagType.HIGHLIGHT
  )!;

  const extractFirstMatch = (inputText: string, regexPattern: RegExp): string | null =>
    inputText.match(regexPattern)?.[0] ?? null;

  // `.match()` with a global regex returns all full-match strings, not capture groups.
  // `matchAll` preserves capture groups — take the first match's group 1.
  const extractCapturedStyleValue = (inputText: string, regexPattern: RegExp): string | null =>
    Array.from(inputText.matchAll(regexPattern))[0]?.[1] ?? null;

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
    test('contains exactly 5 entries', () => {
      expect(SPAN_TAG_REGEX).toHaveLength(5);
    });
  });

  describe('ordering', () => {
    test('ALIGN appears before COLOR to avoid false match on multi-property spans', () => {
      const alignIndex = SPAN_TAG_REGEX.findIndex(
        (entry) => entry.type === ESpanStyleTagType.ALIGN
      );
      const colorIndex = SPAN_TAG_REGEX.findIndex(
        (entry) => entry.type === ESpanStyleTagType.COLOR
      );
      expect(alignIndex).toBeLessThan(colorIndex);
    });
  });

  describe('ALIGN', () => {
    test.each`
      caseLabel                  | matchingInput                              | expectedMatches                              | expectedCapturedStyle
      ${'compact >'}             | ${'<span style="text-align: center;">'}    | ${['<span style="text-align: center;">']}    | ${'text-align: center;'}
      ${'single space before >'} | ${'<span style="text-align: center;" >'}   | ${['<span style="text-align: center;" >']}   | ${'text-align: center;'}
      ${'multi space before >'}  | ${'<span style="text-align: center;"   >'} | ${['<span style="text-align: center;"   >']} | ${'text-align: center;'}
    `(
      'open matches $caseLabel and captures style value',
      ({
        matchingInput,
        expectedMatches,
        expectedCapturedStyle,
      }: {
        matchingInput: string;
        expectedMatches: string[];
        expectedCapturedStyle: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, alignEntry.open, expectedMatches);
        expect(extractCapturedStyleValue(matchingInput, alignEntry.open)).toBe(
          expectedCapturedStyle
        );
      }
    );

    test('open rejects invalid style', () => {
      const nonMatchingInput = '<span style="color: red;">';
      const expectedNonMatching: string[] = [];

      assertMatchesAgainstExpected(nonMatchingInput, alignEntry.open, expectedNonMatching);
    });

    test.each`
      caseLabel                  | inputText                                                 | expectedMatches
      ${'compact tags'}          | ${'<span style="text-align: center;">hello</span>'}       | ${['</span>']}
      ${'spaced open and close'} | ${'<span style="text-align: center;"   >hello</span   >'} | ${['</span   >']}
    `(
      'close matches $caseLabel when corresponding open style exists',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, alignEntry.close, expectedMatches);
      }
    );

    test('close matches </span> even without preceding text-align span', () => {
      const expectedMatches = ['</span>'];
      assertMatchesAgainstExpected(
        '<span style="color: red;">hello</span>',
        alignEntry.close,
        expectedMatches
      );
    });

    test('close does not match when there is whitespace between < and /', () => {
      const expectedMatches: string[] = [];
      assertMatchesAgainstExpected(
        '<span style="text-align: center;">hello<   /   span   >',
        alignEntry.close,
        expectedMatches
      );
    });
  });

  describe('COLOR', () => {
    test.each`
      caseLabel                  | matchingInput                      | expectedMatches                      | expectedCapturedStyle
      ${'compact >'}             | ${'<span style="color: red;">'}    | ${['<span style="color: red;">']}    | ${'color: red;'}
      ${'single space before >'} | ${'<span style="color: red;" >'}   | ${['<span style="color: red;" >']}   | ${'color: red;'}
      ${'multi space before >'}  | ${'<span style="color: red;"   >'} | ${['<span style="color: red;"   >']} | ${'color: red;'}
    `(
      'open matches $caseLabel and captures style value',
      ({
        matchingInput,
        expectedMatches,
        expectedCapturedStyle,
      }: {
        matchingInput: string;
        expectedMatches: string[];
        expectedCapturedStyle: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, colorEntry.open, expectedMatches);
        expect(extractCapturedStyleValue(matchingInput, colorEntry.open)).toBe(
          expectedCapturedStyle
        );
      }
    );

    test('open rejects invalid style', () => {
      const nonMatchingInput = '<span style="font-size: 12px;">';
      const expectedNonMatching: string[] = [];

      assertMatchesAgainstExpected(nonMatchingInput, colorEntry.open, expectedNonMatching);
    });

    test.each`
      caseLabel                  | inputText                                         | expectedMatches
      ${'compact tags'}          | ${'<span style="color: red;">hello</span>'}       | ${['</span>']}
      ${'spaced open and close'} | ${'<span style="color: red;"   >hello</span   >'} | ${['</span   >']}
    `(
      'close matches $caseLabel when corresponding open style exists',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, colorEntry.close, expectedMatches);
      }
    );
  });

  describe('FONT_SIZE', () => {
    test.each`
      caseLabel                  | matchingInput                           | expectedMatches                           | expectedCapturedStyle
      ${'compact >'}             | ${'<span style="font-size: 14px;">'}    | ${['<span style="font-size: 14px;">']}    | ${'font-size: 14px;'}
      ${'single space before >'} | ${'<span style="font-size: 14px;" >'}   | ${['<span style="font-size: 14px;" >']}   | ${'font-size: 14px;'}
      ${'multi space before >'}  | ${'<span style="font-size: 14px;"   >'} | ${['<span style="font-size: 14px;"   >']} | ${'font-size: 14px;'}
    `(
      'open matches $caseLabel and captures style value',
      ({
        matchingInput,
        expectedMatches,
        expectedCapturedStyle,
      }: {
        matchingInput: string;
        expectedMatches: string[];
        expectedCapturedStyle: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, fontSizeEntry.open, expectedMatches);
        expect(extractCapturedStyleValue(matchingInput, fontSizeEntry.open)).toBe(
          expectedCapturedStyle
        );
      }
    );

    test('open rejects invalid style', () => {
      const nonMatchingInput = '<span style="color: blue;">';
      const expectedNonMatching: string[] = [];

      assertMatchesAgainstExpected(nonMatchingInput, fontSizeEntry.open, expectedNonMatching);
    });
  });

  describe('FONT_FAMILY', () => {
    test.each`
      caseLabel                  | matchingInput                              | expectedMatches                              | expectedCapturedStyle
      ${'compact >'}             | ${'<span style="font-family: Arial;">'}    | ${['<span style="font-family: Arial;">']}    | ${'font-family: Arial;'}
      ${'single space before >'} | ${'<span style="font-family: Arial;" >'}   | ${['<span style="font-family: Arial;" >']}   | ${'font-family: Arial;'}
      ${'multi space before >'}  | ${'<span style="font-family: Arial;"   >'} | ${['<span style="font-family: Arial;"   >']} | ${'font-family: Arial;'}
    `(
      'open matches $caseLabel and captures style value',
      ({
        matchingInput,
        expectedMatches,
        expectedCapturedStyle,
      }: {
        matchingInput: string;
        expectedMatches: string[];
        expectedCapturedStyle: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, fontFamilyEntry.open, expectedMatches);
        expect(extractCapturedStyleValue(matchingInput, fontFamilyEntry.open)).toBe(
          expectedCapturedStyle
        );
      }
    );

    test('open rejects invalid style', () => {
      const nonMatchingInput = '<span style="color: blue;">';
      const expectedNonMatching: string[] = [];

      assertMatchesAgainstExpected(nonMatchingInput, fontFamilyEntry.open, expectedNonMatching);
    });
  });

  describe('HIGHLIGHT', () => {
    test.each`
      caseLabel                  | matchingInput                              | expectedMatches                              | expectedCapturedStyle
      ${'compact >'}             | ${'<span style="background: yellow;">'}    | ${['<span style="background: yellow;">']}    | ${'background: yellow;'}
      ${'single space before >'} | ${'<span style="background: yellow;" >'}   | ${['<span style="background: yellow;" >']}   | ${'background: yellow;'}
      ${'multi space before >'}  | ${'<span style="background: yellow;"   >'} | ${['<span style="background: yellow;"   >']} | ${'background: yellow;'}
    `(
      'open matches $caseLabel and captures style value',
      ({
        matchingInput,
        expectedMatches,
        expectedCapturedStyle,
      }: {
        matchingInput: string;
        expectedMatches: string[];
        expectedCapturedStyle: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, highlightEntry.open, expectedMatches);
        expect(extractCapturedStyleValue(matchingInput, highlightEntry.open)).toBe(
          expectedCapturedStyle
        );
      }
    );

    test('open rejects invalid style', () => {
      const nonMatchingInput = '<span style="color: blue;">';
      const expectedNonMatching: string[] = [];

      assertMatchesAgainstExpected(nonMatchingInput, highlightEntry.open, expectedNonMatching);
    });
  });
});
