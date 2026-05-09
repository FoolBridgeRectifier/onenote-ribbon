import { HTML_TAG_REGEX } from '../html';
import { EHtmlStyleTagType } from '../../../../../interfaces';
import { assertMatches } from '../../tests/testUtils';

describe('HTML_TAG_REGEX', () => {
  const underlineEntry = HTML_TAG_REGEX.find(
    (entry) => entry.type === EHtmlStyleTagType.UNDERLINE
  )!;
  const subscriptEntry = HTML_TAG_REGEX.find(
    (entry) => entry.type === EHtmlStyleTagType.SUBSCRIPT
  )!;
  const superscriptEntry = HTML_TAG_REGEX.find(
    (entry) => entry.type === EHtmlStyleTagType.SUPERSCRIPT
  )!;

  describe('shape', () => {
    test('contains exactly 3 entries', () => {
      expect(HTML_TAG_REGEX).toHaveLength(3);
    });
  });

  describe('UNDERLINE', () => {
    test.each`
      content           | expectedMatches
      ${'<u>'}          | ${['<u>']}
      ${'<u   >'}       | ${['<u   >']}
      ${'<ul>'}         | ${[]}
    `('open matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, underlineEntry.open, expectedMatches);
    });

    test.each`
      content             | expectedMatches
      ${'</u>'}           | ${['</u>']}
      ${'</u   >'}        | ${['</u   >']}
      ${'</   u   >'}     | ${['</   u   >']}
      ${'</ul>'}          | ${[]}
      ${'<   /   u   >'}  | ${[]}
    `('close matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, underlineEntry.close, expectedMatches);
    });
  });

  describe('SUBSCRIPT', () => {
    test.each`
      content        | expectedMatches
      ${'<sub>'}     | ${['<sub>']}
      ${'<sub   >'}  | ${['<sub   >']}
      ${'<subtext>'} | ${[]}
    `('open matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, subscriptEntry.open, expectedMatches);
    });

    test.each`
      content               | expectedMatches
      ${'</sub>'}           | ${['</sub>']}
      ${'</sub   >'}        | ${['</sub   >']}
      ${'</   sub   >'}     | ${['</   sub   >']}
      ${'</subtext>'}       | ${[]}
      ${'<   /   sub   >'}  | ${[]}
    `('close matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, subscriptEntry.close, expectedMatches);
    });
  });

  describe('SUPERSCRIPT', () => {
    test.each`
      content        | expectedMatches
      ${'<sup>'}     | ${['<sup>']}
      ${'<sup   >'}  | ${['<sup   >']}
      ${'<super>'}   | ${[]}
    `('open matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, superscriptEntry.open, expectedMatches);
    });

    test.each`
      content               | expectedMatches
      ${'</sup>'}           | ${['</sup>']}
      ${'</sup   >'}        | ${['</sup   >']}
      ${'</   sup   >'}     | ${['</   sup   >']}
      ${'</super>'}         | ${[]}
      ${'<   /   sup   >'}  | ${[]}
    `('close matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, superscriptEntry.close, expectedMatches);
    });
  });
});
