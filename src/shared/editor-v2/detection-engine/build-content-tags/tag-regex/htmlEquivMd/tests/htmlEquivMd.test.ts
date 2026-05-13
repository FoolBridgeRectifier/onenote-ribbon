import { HTML_EQUIV_MD_TAG_REGEX } from '../htmlEquivMd';
import { EMdStyleTagType } from '../../../../../interfaces';
import { assertMatches } from '../../tests/testUtils';

describe('HTML_EQUIV_MD_TAG_REGEX', () => {
  const boldEntry = HTML_EQUIV_MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.BOLD)!;
  const italicEntry = HTML_EQUIV_MD_TAG_REGEX.find(
    (entry) => entry.type === EMdStyleTagType.ITALIC
  )!;
  const strikethroughEntry = HTML_EQUIV_MD_TAG_REGEX.find(
    (entry) => entry.type === EMdStyleTagType.STRIKETHROUGH
  )!;

  describe('shape', () => {
    test('contains exactly 3 entries', () => {
      expect(HTML_EQUIV_MD_TAG_REGEX).toHaveLength(3);
    });
  });

  describe('BOLD', () => {
    test.each`
      content        | expectedMatches
      ${'<b>'}       | ${['<b>']}
      ${'<b   >'}    | ${['<b   >']}
      ${'<   b   >'} | ${[]}
      ${'<strong>'}  | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, boldEntry.open, expectedMatches);
      }
    );

    test.each`
      content            | expectedMatches
      ${'</b>'}          | ${['</b>']}
      ${'</b   >'}       | ${['</b   >']}
      ${'</   b   >'}    | ${['</   b   >']}
      ${'</strong>'}     | ${[]}
      ${'<   /   b   >'} | ${[]}
    `(
      'close matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, boldEntry.close, expectedMatches);
      }
    );
  });

  describe('ITALIC', () => {
    test.each`
      content        | expectedMatches
      ${'<i>'}       | ${['<i>']}
      ${'<i   >'}    | ${['<i   >']}
      ${'<   i   >'} | ${['<   i   >']}
      ${'<em>'}      | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, italicEntry.open, expectedMatches);
      }
    );

    test.each`
      content            | expectedMatches
      ${'</i>'}          | ${['</i>']}
      ${'</i   >'}       | ${['</i   >']}
      ${'</   i   >'}    | ${['</   i   >']}
      ${'</em>'}         | ${[]}
      ${'<   /   i   >'} | ${[]}
    `(
      'close matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, italicEntry.close, expectedMatches);
      }
    );
  });

  describe('STRIKETHROUGH', () => {
    test.each`
      content        | expectedMatches
      ${'<s>'}       | ${['<s>']}
      ${'<s   >'}    | ${['<s   >']}
      ${'<   s   >'} | ${['<   s   >']}
      ${'<strike>'}  | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, strikethroughEntry.open, expectedMatches);
      }
    );

    test.each`
      content            | expectedMatches
      ${'</s>'}          | ${['</s>']}
      ${'</s   >'}       | ${['</s   >']}
      ${'</   s   >'}    | ${['</   s   >']}
      ${'</strike>'}     | ${[]}
      ${'<   /   s   >'} | ${[]}
    `(
      'close matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, strikethroughEntry.close, expectedMatches);
      }
    );
  });
});
