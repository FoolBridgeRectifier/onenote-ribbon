import { SPECIAL_TAG_REGEX } from '../special';
import { ESpecialTagType } from '../../../../../interfaces';
import { assertMatches, extractCapturedGroup } from '../../tests/testUtils';

describe('SPECIAL_TAG_REGEX', () => {
  const fencedCodeEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.BLOCK_CODE
  )!;
  const tabCodeEntry = SPECIAL_TAG_REGEX.find((entry) => entry.type === ESpecialTagType.LINE_CODE)!;
  const inlineCodeEntry = SPECIAL_TAG_REGEX.find(
    (entry) => entry.type === ESpecialTagType.INLINE_CODE
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
      content    | expectedMatches
      ${'```'}   | ${['```']}
      ${'```js'} | ${['```']}
      ${'````'}  | ${['```']}
      ${'``'}    | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, fencedCodeEntry.open, expectedMatches);
      }
    );

    test.each`
      content        | expectedMatches
      ${'\n```'}     | ${['```']}
      ${'\n`````'}   | ${['```']}
      ${'\n```  '}   | ${['```']}
      ${'```'}       | ${['```']}
      ${'\n  ```'}   | ${[]}
      ${'\n`````ff'} | ${[]}
    `(
      'close matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, fencedCodeEntry.close!, expectedMatches);
      }
    );
  });

  describe('TAB_INDENTED_CODE', () => {
    test.each`
      content                             | expectedMatches | allMatches
      ${'\tcode at start'}                | ${['\t']}       | ${false}
      ${'\n\n\tcode after blank'}         | ${['\t']}       | ${false}
      ${'\tcode \n\tat start'}            | ${['\t']}       | ${true}
      ${'\n\n\tcode \n\tafter blank'}     | ${['\t']}       | ${true}
      ${'\n\n\tcode \tafter blank'}       | ${['\t']}       | ${true}
      ${'\n\n\tcode \ngg\n\tafter blank'} | ${['\t']}       | ${true}
      ${'    code at start'}              | ${['    ']}     | ${false}
      ${'---\n\tcode'}                    | ${['\t']}       | ${false}
      ${'---\n---\n\tcode'}               | ${['\t']}       | ${false}
      ${'---\nkey: value\n-----\n\tcode'} | ${['\t']}       | ${false}
      ${'----\n\tcode'}                   | ${[]}           | ${false}
    `(
      'open matches $content',
      ({
        content,
        expectedMatches,
        allMatches,
      }: {
        content: string;
        expectedMatches: string[];
        allMatches: boolean;
      }) => {
        assertMatches(content, tabCodeEntry.open, expectedMatches, allMatches);
      }
    );

    test('close is null (atomic token)', () => {
      expect(tabCodeEntry.close).toBeFalsy();
    });
  });

  describe('INLINE_CODE', () => {
    test.each`
      content        | expectedMatches
      ${'`code` ``'} | ${['`', '`']}
      ${'``'}        | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, inlineCodeEntry.open, expectedMatches, true);
      }
    );

    test.each`
      content        | expectedMatches
      ${'`code` ``'} | ${['`', '`']}
      ${'``'}        | ${[]}
    `(
      'close matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, inlineCodeEntry.close!, expectedMatches, true);
      }
    );
  });

  describe('INLINE_TODO', () => {
    test.each`
      content              | expectedMatches
      ${'#todo'}           | ${['#todo']}
      ${'text #todo more'} | ${['#todo']}
      ${'#todos'}          | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, inlineTodoEntry.open, expectedMatches);
      }
    );

    test('close is null (atomic token)', () => {
      expect(inlineTodoEntry.close).toBeFalsy();
    });
  });

  describe('MEETING_DETAILS', () => {
    test.each`
      content                                                                   | expectedMatches
      ${'---\ntitle: My Meeting\ndate: 2024-01-01\n---'}                        | ${['---\ntitle: My Meeting\ndate: 2024-01-01\n---']}
      ${'---\ntitle: My Meeting\ndate: 2024-01-01\n---\n'}                      | ${['---\ntitle: My Meeting\ndate: 2024-01-01\n---']}
      ${'---\ntitle: My Meeting\ndate: 2024-01-01\n---\n\n## Agenda\n- item 1'} | ${['---\ntitle: My Meeting\ndate: 2024-01-01\n---']}
      ${'---\n---'}                                                             | ${[]}
      ${'---\ntitle: My Meeting\n'}                                             | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, meetingDetailsEntry.open, expectedMatches);
      }
    );

    test('close is null (atomic token)', () => {
      expect(meetingDetailsEntry.close).toBeFalsy();
    });
  });

  describe('EMBED', () => {
    test.each`
      content             | expectedMatches       | capturedFilename
      ${'![[image.png]]'} | ${['![[image.png]]']} | ${'image.png'}
      ${'[[wikilink]]'}   | ${[]}                 | ${null}
    `(
      'open matches $content',
      ({
        content,
        expectedMatches,
        capturedFilename,
      }: {
        content: string;
        expectedMatches: string[];
        capturedFilename: string | null;
      }) => {
        assertMatches(content, embedEntry.open, expectedMatches);
        if (capturedFilename !== null) {
          expect(extractCapturedGroup(content, embedEntry.open, 1)).toBe(capturedFilename);
        }
      }
    );

    test('close is null (atomic token)', () => {
      expect(embedEntry.close).toBeFalsy();
    });
  });

  describe('WIKILINK', () => {
    test.each`
      content                 | expectedMatches      | capturedPage
      ${'[[Page Name]]'}      | ${['[[Page Name]]']} | ${'Page Name'}
      ${'not-[[link]]'}       | ${['[[link]]']}      | ${'link'}
      ${'word-[[Page Name]]'} | ${['[[Page Name]]']} | ${'Page Name'}
      ${'[link](url)'}        | ${[]}                | ${null}
      ${'[^note]'}            | ${[]}                | ${null}
      ${'[!note]'}            | ${[]}                | ${null}
      ${'[note]'}             | ${[]}                | ${null}
      ${'- [bare link]'}      | ${[]}                | ${null}
      ${'- [x] item'}         | ${[]}                | ${null}
      ${'- [ ] item'}         | ${[]}                | ${null}
      ${'- [[Page Name]]'}    | ${[]}                | ${null}
      ${'-[[Page Name]]'}     | ${[]}                | ${null}
    `(
      'open matches $content',
      ({
        content,
        expectedMatches,
        capturedPage,
      }: {
        content: string;
        expectedMatches: string[];
        capturedPage: string | null;
      }) => {
        assertMatches(content, wikilinkEntry.open, expectedMatches);
        if (capturedPage !== null) {
          expect(extractCapturedGroup(content, wikilinkEntry.open, 1)).toBe(capturedPage);
        }
      }
    );

    test('close is null (atomic token)', () => {
      expect(wikilinkEntry.close).toBeFalsy();
    });
  });

  describe('EXTERNAL_LINK', () => {
    test.each`
      expectedMatches
      ${['[Click here](https://example.com)']}
      ${['https://example.com']}
      ${['http://example.com']}
      ${['www.example.com']}
      ${['example.com']}
      ${['myapp.io']}
      ${[]}
    `('open matches $expectedMatches', ({ expectedMatches }: { expectedMatches: string[] }) => {
      const content = expectedMatches[0] ?? 'example.xyz';
      assertMatches(content, externalLinkEntry.open, expectedMatches);
    });

    test('close is null (atomic token)', () => {
      expect(externalLinkEntry.close).toBeFalsy();
    });
  });

  describe('FOOTNOTE_REF', () => {
    test.each`
      content            | expectedMatches  | capturedId
      ${'[^note1]'}      | ${['[^note1]']}  | ${'note1'}
      ${'hel [^note1]:'} | ${['[^note1]:']} | ${'note1'}
      ${'[^abc123]'}     | ${['[^abc123]']} | ${'abc123'}
      ${'[^note]:'}      | ${[]}            | ${null}
      ${'[note]'}        | ${[]}            | ${null}
      ${'[[note]]'}      | ${[]}            | ${null}
      ${'[^]'}           | ${[]}            | ${null}
    `(
      'open matches $content',
      ({
        content,
        expectedMatches,
        capturedId,
      }: {
        content: string;
        expectedMatches: string[];
        capturedId: string | null;
      }) => {
        assertMatches(content, footnoteRefEntry.open, expectedMatches);
        if (capturedId !== null) {
          // Open uses alternation — id lands in group 1 (no-colon alt) or group 2 (colon alt).
          expect(extractCapturedGroup(content, footnoteRefEntry.open, 1, 2)).toBe(capturedId);
        }
      }
    );

    test.each`
      content            | expectedMatches  | capturedId
      ${'[^note1]:'}     | ${['[^note1]:']} | ${'note1'}
      ${'hel [^note1]:'} | ${[]}            | ${null}
      ${'[^note1]'}      | ${[]}            | ${null}
      ${'[^abc123]'}     | ${[]}            | ${null}
      ${'[note]'}        | ${[]}            | ${null}
      ${'[[note]]'}      | ${[]}            | ${null}
      ${'[^]'}           | ${[]}            | ${null}
    `(
      'close matches $content',
      ({
        content,
        expectedMatches,
        capturedId,
      }: {
        content: string;
        expectedMatches: string[];
        capturedId: string | null;
      }) => {
        assertMatches(content, footnoteRefEntry.close!, expectedMatches);
        if (capturedId !== null) {
          expect(extractCapturedGroup(content, footnoteRefEntry.close!, 1)).toBe(capturedId);
        }
      }
    );
  });
});
