import {
  buildTextIndex,
  positionToOffset,
  offsetToPosition,
  clamp,
} from './TextOffset';

describe('textOffset', () => {
  describe('clamp', () => {
    it('returns the value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('clamps to the minimum when value is below range', () => {
      expect(clamp(-3, 0, 10)).toBe(0);
    });

    it('clamps to the maximum when value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns the boundary when value equals minimum', () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it('returns the boundary when value equals maximum', () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('buildTextIndex', () => {
    it('builds an index for a single line with no newlines', () => {
      const textIndex = buildTextIndex('hello');

      expect(textIndex.lineStartOffsets).toEqual([0]);
      expect(textIndex.lineLengths).toEqual([5]);
      expect(textIndex.sourceLength).toBe(5);
    });

    it('builds an index for multiple lines', () => {
      const textIndex = buildTextIndex('abc\ndef\nghi');

      expect(textIndex.lineStartOffsets).toEqual([0, 4, 8]);
      expect(textIndex.lineLengths).toEqual([3, 3, 3]);
      expect(textIndex.sourceLength).toBe(11);
    });

    it('handles an empty string', () => {
      const textIndex = buildTextIndex('');

      expect(textIndex.lineStartOffsets).toEqual([0]);
      expect(textIndex.lineLengths).toEqual([0]);
      expect(textIndex.sourceLength).toBe(0);
    });

    it('handles lines of different lengths', () => {
      const textIndex = buildTextIndex('a\nbc\ndef');

      expect(textIndex.lineStartOffsets).toEqual([0, 2, 5]);
      expect(textIndex.lineLengths).toEqual([1, 2, 3]);
      expect(textIndex.sourceLength).toBe(8);
    });

    it('handles consecutive newlines (empty lines)', () => {
      const textIndex = buildTextIndex('a\n\nb');

      expect(textIndex.lineStartOffsets).toEqual([0, 2, 3]);
      expect(textIndex.lineLengths).toEqual([1, 0, 1]);
      expect(textIndex.sourceLength).toBe(4);
    });
  });

  describe('positionToOffset', () => {
    it('converts a single-line position to offset', () => {
      const textIndex = buildTextIndex('hello');

      expect(positionToOffset({ line: 0, ch: 3 }, textIndex)).toBe(3);
    });

    it('converts a multi-line position to offset', () => {
      const textIndex = buildTextIndex('abc\ndef\nghi');

      expect(positionToOffset({ line: 1, ch: 2 }, textIndex)).toBe(6);
      expect(positionToOffset({ line: 2, ch: 1 }, textIndex)).toBe(9);
    });

    it('returns 0 for an empty string regardless of position', () => {
      const textIndex = buildTextIndex('');

      expect(positionToOffset({ line: 0, ch: 0 }, textIndex)).toBe(0);
      expect(positionToOffset({ line: 5, ch: 10 }, textIndex)).toBe(0);
    });

    it('clamps a negative line to line 0', () => {
      const textIndex = buildTextIndex('abc\ndef');

      expect(positionToOffset({ line: -1, ch: 2 }, textIndex)).toBe(2);
    });

    it('clamps a line beyond the last line to the last line', () => {
      const textIndex = buildTextIndex('abc\ndef');

      expect(positionToOffset({ line: 99, ch: 1 }, textIndex)).toBe(5);
    });

    it('clamps a negative ch to 0', () => {
      const textIndex = buildTextIndex('abc\ndef');

      expect(positionToOffset({ line: 1, ch: -5 }, textIndex)).toBe(4);
    });

    it('clamps ch beyond line length to line length', () => {
      const textIndex = buildTextIndex('abc\ndef');

      expect(positionToOffset({ line: 0, ch: 100 }, textIndex)).toBe(3);
    });

    it('handles the position at the start of a line', () => {
      const textIndex = buildTextIndex('abc\ndef');

      expect(positionToOffset({ line: 1, ch: 0 }, textIndex)).toBe(4);
    });

    it('handles the position at the end of the last line', () => {
      const textIndex = buildTextIndex('abc\ndef');

      expect(positionToOffset({ line: 1, ch: 3 }, textIndex)).toBe(7);
    });
  });

  describe('offsetToPosition', () => {
    it('converts offset 0 to line 0, ch 0', () => {
      const textIndex = buildTextIndex('hello');

      expect(offsetToPosition(0, textIndex)).toEqual({ line: 0, ch: 0 });
    });

    it('converts an offset in the middle of a single line', () => {
      const textIndex = buildTextIndex('hello');

      expect(offsetToPosition(3, textIndex)).toEqual({ line: 0, ch: 3 });
    });

    it('converts an offset at the end of a single line', () => {
      const textIndex = buildTextIndex('hello');

      expect(offsetToPosition(5, textIndex)).toEqual({ line: 0, ch: 5 });
    });

    it('converts an offset at the start of each line', () => {
      const textIndex = buildTextIndex('abc\ndef\nghi');

      expect(offsetToPosition(0, textIndex)).toEqual({ line: 0, ch: 0 });
      expect(offsetToPosition(4, textIndex)).toEqual({ line: 1, ch: 0 });
      expect(offsetToPosition(8, textIndex)).toEqual({ line: 2, ch: 0 });
    });

    it('converts an offset in the middle of a later line', () => {
      const textIndex = buildTextIndex('abc\ndef\nghi');

      expect(offsetToPosition(6, textIndex)).toEqual({ line: 1, ch: 2 });
      expect(offsetToPosition(9, textIndex)).toEqual({ line: 2, ch: 1 });
    });

    it('converts an offset just before a newline', () => {
      const textIndex = buildTextIndex('abc\ndef');

      // Offset 3 is the last character of line 0 (the 'c')
      expect(offsetToPosition(3, textIndex)).toEqual({ line: 0, ch: 3 });
    });

    it('converts an offset just after a newline', () => {
      const textIndex = buildTextIndex('abc\ndef');

      // Offset 4 is the first character of line 1 (the 'd')
      expect(offsetToPosition(4, textIndex)).toEqual({ line: 1, ch: 0 });
    });

    it('clamps a negative offset to 0', () => {
      const textIndex = buildTextIndex('hello');

      expect(offsetToPosition(-5, textIndex)).toEqual({ line: 0, ch: 0 });
    });

    it('clamps an offset beyond sourceLength to the end position', () => {
      const textIndex = buildTextIndex('abc\ndef');

      expect(offsetToPosition(100, textIndex)).toEqual({ line: 1, ch: 3 });
    });

    it('returns line 0, ch 0 for an empty string', () => {
      const textIndex = buildTextIndex('');

      expect(offsetToPosition(0, textIndex)).toEqual({ line: 0, ch: 0 });
    });

    it('handles consecutive newlines (empty lines)', () => {
      const textIndex = buildTextIndex('a\n\nb');

      expect(offsetToPosition(2, textIndex)).toEqual({ line: 1, ch: 0 });
      expect(offsetToPosition(3, textIndex)).toEqual({ line: 2, ch: 0 });
    });
  });

  describe('round-trip: positionToOffset and offsetToPosition', () => {
    it('round-trips a single-line position', () => {
      const textIndex = buildTextIndex('hello world');
      const originalPosition = { line: 0, ch: 6 };

      const offset = positionToOffset(originalPosition, textIndex);
      const recoveredPosition = offsetToPosition(offset, textIndex);

      expect(recoveredPosition).toEqual(originalPosition);
    });

    it('round-trips a multi-line position', () => {
      const textIndex = buildTextIndex('first\nsecond\nthird');
      const originalPosition = { line: 2, ch: 3 };

      const offset = positionToOffset(originalPosition, textIndex);
      const recoveredPosition = offsetToPosition(offset, textIndex);

      expect(recoveredPosition).toEqual(originalPosition);
    });

    it('round-trips the start of a middle line', () => {
      const textIndex = buildTextIndex('aaa\nbbb\nccc');
      const originalPosition = { line: 1, ch: 0 };

      const offset = positionToOffset(originalPosition, textIndex);
      const recoveredPosition = offsetToPosition(offset, textIndex);

      expect(recoveredPosition).toEqual(originalPosition);
    });

    it('round-trips the end of the last line', () => {
      const textIndex = buildTextIndex('abc\ndef');
      const originalPosition = { line: 1, ch: 3 };

      const offset = positionToOffset(originalPosition, textIndex);
      const recoveredPosition = offsetToPosition(offset, textIndex);

      expect(recoveredPosition).toEqual(originalPosition);
    });

    it('round-trips every position in a multi-line string', () => {
      const sourceText = 'ab\ncde\nf';
      const textIndex = buildTextIndex(sourceText);
      const sourceLines = sourceText.split('\n');

      for (
        let lineIndex = 0;
        lineIndex < sourceLines.length;
        lineIndex += 1
      ) {
        for (
          let charIndex = 0;
          charIndex <= sourceLines[lineIndex].length;
          charIndex += 1
        ) {
          const position = { line: lineIndex, ch: charIndex };
          const offset = positionToOffset(position, textIndex);
          const recoveredPosition = offsetToPosition(offset, textIndex);

          expect(recoveredPosition).toEqual(position);
        }
      }
    });
  });
});
