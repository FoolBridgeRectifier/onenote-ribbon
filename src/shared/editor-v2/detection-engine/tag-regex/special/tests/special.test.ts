import { SPECIAL_TAG_REGEX } from '../special';
import { ESpecialTagType } from '../../../../interfaces';

describe('SPECIAL_TAG_REGEX', () => {
  const fencedCodeEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.CODE && entry.open.source === '^`{3,}'
  )!;

  // Tab-code is the CODE entry that is atomic (close === null) and not the fenced or inline entry.
  const tabCodeEntry = SPECIAL_TAG_REGEX.find(
    (entry) =>
      entry.type === ESpecialTagType.CODE &&
      entry.close === null &&
      entry.open !== fencedCodeEntry?.open &&
      entry.open.source !== '`'
  )!;

  const inlineCodeEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.CODE && entry.open.source === '`'
  )!;
  const inlineTodoEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.INLINE_TODO
  )!;
  const meetingDetailsEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.MEETING_DETAILS
  )!;
  const embedEntry = SPECIAL_TAG_REGEX.find((entry) => entry.type === ESpecialTagType.EMBED)!;
  const wikilinkEntry = SPECIAL_TAG_REGEX.find((entry) => entry.type === ESpecialTagType.WIKILINK)!;
  const externalLinkEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.EXTERNAL_LINK
  )!;
  const footnoteRefEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.FOOTNOTE_REF
  )!;

  const extractFirstMatch = (inputText: string, regexPattern: RegExp): string | null =>
    inputText.match(regexPattern)?.[0] ?? null;

  const extractCapturedGroupValue = (
    inputText: string,
    regexPattern: RegExp,
    groupIndex: number
  ): string | null => inputText.match(regexPattern)?.[groupIndex] ?? null;

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

  describe('ordering', () => {
    test('EMBED appears before WIKILINK so ![[ is consumed before [[', () => {
      const embedIndex = SPECIAL_TAG_REGEX.findIndex(
        (entry) => entry.type === ESpecialTagType.EMBED
      );
      const wikilinkIndex = SPECIAL_TAG_REGEX.findIndex(
        (entry) => entry.type === ESpecialTagType.WIKILINK
      );
      expect(embedIndex).toBeLessThan(wikilinkIndex);
    });
  });

  describe('FENCED_CODE', () => {
    test.each`
      caseLabel                   | inputText  | expectedMatches
      ${'``` at line start'}      | ${'```'}   | ${['```']}
      ${'``` with language hint'} | ${'```js'} | ${['```']}
      ${'4+ backticks'}           | ${'````'}  | ${['````']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, fencedCodeEntry.open, expectedMatches);
      }
    );

    test('open does not match `` (only 2 backticks)', () => {
      assertMatchesAgainstExpected('``', fencedCodeEntry.open, []);
    });

    test.each`
      caseLabel    | inputText    | expectedMatches
      ${'```'}     | ${'```'}     | ${['```']}
      ${'  ```  '} | ${'  ```  '} | ${['  ```  ']}
    `(
      'close matches $caseLabel with optional surrounding whitespace',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, fencedCodeEntry.close!, expectedMatches);
      }
    );
  });

  describe('TAB_INDENTED_CODE', () => {
    test.each`
      caseLabel                                               | inputText                           | expectedMatches
      ${'at document start'}                                  | ${'\tcode at start'}                | ${['\t']}
      ${'after blank line'}                                   | ${'\n\n\tcode after blank'}         | ${['\t']}
      ${'4-space indent at start'}                            | ${'    code at start'}              | ${['    ']}
      ${'directly after opening --- at document start'}       | ${'---\n\tcode'}                    | ${['\t']}
      ${'after ---/--- frontmatter block at document start'}  | ${'---\n---\n\tcode'}               | ${['\t']}
      ${'after full meeting-details block at document start'} | ${'---\nkey: value\n-----\n\tcode'} | ${['\t']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, tabCodeEntry.open, expectedMatches);
      }
    );

    test('close is null (atomic token)', () => {
      expect(tabCodeEntry.close).toBeNull();
    });

    test('open does not match after ---- at document start (not a --- delimiter)', () => {
      // ---- is 4 dashes — not a valid frontmatter opener, so no special treatment
      assertMatchesAgainstExpected('----\n\tcode', tabCodeEntry.open, []);
    });
  });

  describe('INLINE_CODE', () => {
    test('open matches single backtick', () => {
      assertMatchesAgainstExpected('`code`', inlineCodeEntry.open, ['`']);
    });

    test('close matches closing backtick', () => {
      assertMatchesAgainstExpected('`', inlineCodeEntry.close!, ['`']);
    });
  });

  describe('INLINE_TODO', () => {
    test.each`
      caseLabel                        | inputText            | expectedMatches
      ${'#todo at document start'}     | ${'#todo'}           | ${['#todo']}
      ${'#todo in the middle of text'} | ${'text #todo more'} | ${['#todo']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, inlineTodoEntry.open, expectedMatches);
      }
    );

    test('open does not match #todolist (no word boundary)', () => {
      assertMatchesAgainstExpected('#todolist', inlineTodoEntry.open, []);
    });

    test('close is null (atomic token)', () => {
      expect(inlineTodoEntry.close).toBeNull();
    });
  });

  describe('MEETING_DETAILS', () => {
    test('open matches valid frontmatter block', () => {
      const inputText = '---\ntitle: My Meeting\ndate: 2024-01-01\n---';
      assertMatchesAgainstExpected(inputText, meetingDetailsEntry.open, [inputText]);
    });

    test.each`
      caseLabel                          | inputText
      ${'block with no key-value pairs'} | ${'---\n---'}
      ${'block missing closing ---'}     | ${'---\ntitle: My Meeting\n'}
    `('open does not match $caseLabel', ({ inputText }: { inputText: string }) => {
      assertMatchesAgainstExpected(inputText, meetingDetailsEntry.open, []);
    });

    test('close is null (atomic token)', () => {
      expect(meetingDetailsEntry.close).toBeNull();
    });
  });

  describe('EMBED', () => {
    test('open matches ![[filename]]', () => {
      const inputText = '![[image.png]]';
      assertMatchesAgainstExpected(inputText, embedEntry.open, [inputText]);
      expect(extractCapturedGroupValue(inputText, embedEntry.open, 1)).toBe('image.png');
    });

    test('open does not match [[wikilink]]', () => {
      assertMatchesAgainstExpected('[[wikilink]]', embedEntry.open, []);
    });

    test('close is null (atomic token)', () => {
      expect(embedEntry.close).toBeNull();
    });
  });

  describe('WIKILINK', () => {
    test('open matches [[link]]', () => {
      const inputText = '[[Page Name]]';
      assertMatchesAgainstExpected(inputText, wikilinkEntry.open, [inputText]);
      expect(extractCapturedGroupValue(inputText, wikilinkEntry.open, 1)).toBe('Page Name');
    });

    test('open matches bare [text] not followed by (', () => {
      assertMatchesAgainstExpected('[bare link]', wikilinkEntry.open, ['[bare link]']);
    });

    test.each`
      caseLabel                          | inputText
      ${'[text](url) markdown link'}     | ${'[link](url)'}
      ${'footnote ref [^id]'}            | ${'[^note]'}
      ${'callout marker [!type]'}        | ${'[!note]'}
      ${'bare link after dash'}          | ${'- [bare link]'}
      ${'checked checkbox bracket'}      | ${'- [x] item'}
      ${'unchecked checkbox bracket'}    | ${'- [ ] item'}
      ${'wikilink after dash with space'}| ${'- [[Page Name]]'}
      ${'wikilink after dash no space'}  | ${'-[[Page Name]]'}
    `('open does not match $caseLabel', ({ inputText }: { inputText: string }) => {
      assertMatchesAgainstExpected(inputText, wikilinkEntry.open, []);
    });

    test('close is null (atomic token)', () => {
      expect(wikilinkEntry.close).toBeNull();
    });
  });

  describe('EXTERNAL_LINK', () => {
    test.each`
      caseLabel                              | inputText                              | expectedMatches
      ${'markdown link [text](url)'}         | ${'[Click here](https://example.com)'} | ${['[Click here](https://example.com)']}
      ${'https:// protocol URL'}             | ${'https://example.com'}               | ${['https://example.com']}
      ${'http:// protocol URL'}              | ${'http://example.com'}                | ${['http://example.com']}
      ${'www. prefixed URL'}                 | ${'www.example.com'}                   | ${['www.example.com']}
      ${'bare domain with known TLD (.com)'} | ${'example.com'}                       | ${['example.com']}
      ${'bare domain with known TLD (.io)'}  | ${'myapp.io'}                          | ${['myapp.io']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, externalLinkEntry.open, expectedMatches);
      }
    );

    test('open does not match domain with unknown TLD', () => {
      assertMatchesAgainstExpected('example.xyz', externalLinkEntry.open, []);
    });

    test('close is null (atomic token)', () => {
      expect(externalLinkEntry.close).toBeNull();
    });
  });

  describe('FOOTNOTE_REF', () => {
    test('open matches inline [^id] reference', () => {
      const inputText = '[^note1]';
      assertMatchesAgainstExpected(inputText, footnoteRefEntry.open, [inputText]);
      expect(extractCapturedGroupValue(inputText, footnoteRefEntry.open, 1)).toBe('note1');
    });

    test('open matches definition line [^id]:', () => {
      // close is null — the definition form is absorbed by open via the optional trailing `:`
      const inputText = '[^note1]:';
      assertMatchesAgainstExpected(inputText, footnoteRefEntry.open, [inputText]);
      expect(extractCapturedGroupValue(inputText, footnoteRefEntry.open, 1)).toBe('note1');
    });

    test('close is null (atomic token — definition absorbed by open)', () => {
      expect(footnoteRefEntry.close).toBeNull();
    });
  });
});
