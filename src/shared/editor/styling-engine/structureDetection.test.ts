import { detectStructureContext } from './structureDetection';

describe('structureDetection', () => {

  // ============================================================
  // Inert Zone Detection
  // ============================================================

  describe('inert zone detection', () => {

    it('marks a line inside a code fence as codeBlock inert', () => {
      const sourceText = '```\nconst x = 1;\n```';
      // Selection covers the inner line "const x = 1;"
      const selectionStart = 4;
      const selectionEnd = 18;

      const result = detectStructureContext(sourceText, selectionStart, selectionEnd);

      expect(result.isFullyInert).toBe(true);
      expect(result.lines[0].inertZone).toBe('codeBlock');
    });

    it('marks a line inside a math block as mathBlock inert', () => {
      const sourceText = '$$\nx^2 + y^2\n$$';
      const selectionStart = 3;
      const selectionEnd = 14;

      const result = detectStructureContext(sourceText, selectionStart, selectionEnd);

      expect(result.isFullyInert).toBe(true);
      expect(result.lines[0].inertZone).toBe('mathBlock');
    });

    it('marks a horizontal rule line as horizontalRule inert', () => {
      const sourceText = '---';
      const selectionStart = 0;
      const selectionEnd = 3;

      const result = detectStructureContext(sourceText, selectionStart, selectionEnd);

      expect(result.isFullyInert).toBe(true);
      expect(result.lines[0].inertZone).toBe('horizontalRule');
    });

    it('marks a table line as table inert', () => {
      const sourceText = '| col1 | col2 |';
      const selectionStart = 0;
      const selectionEnd = 15;

      const result = detectStructureContext(sourceText, selectionStart, selectionEnd);

      expect(result.isFullyInert).toBe(true);
      expect(result.lines[0].inertZone).toBe('table');
    });

    it('marks inline math within selection as inlineMath inert', () => {
      const sourceText = '$x^2$';
      const selectionStart = 0;
      const selectionEnd = 5;

      const result = detectStructureContext(sourceText, selectionStart, selectionEnd);

      expect(result.isFullyInert).toBe(true);
      expect(result.lines[0].inertZone).toBe('inlineMath');
    });

    it('marks inline code within selection as inlineCode inert', () => {
      const sourceText = '`code`';
      const selectionStart = 0;
      const selectionEnd = 6;

      const result = detectStructureContext(sourceText, selectionStart, selectionEnd);

      expect(result.isFullyInert).toBe(true);
      expect(result.lines[0].inertZone).toBe('inlineCode');
    });
  });

  // ============================================================
  // Line Prefix Extraction
  // ============================================================

  describe('line prefix extraction', () => {

    it('detects no prefix for plain text', () => {
      const sourceText = 'hello world';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].linePrefixType).toBe('none');
      expect(result.lines[0].linePrefix).toBeNull();
      expect(result.lines[0].inertZone).toBeNull();
      expect(result.protectedRanges).toEqual([]);
      expect(result.isFullyInert).toBe(false);
    });

    it('detects heading prefix', () => {
      const sourceText = '## My Heading';
      // Cursor somewhere in "My"
      const selectionStart = 4;
      const selectionEnd = 6;

      const result = detectStructureContext(sourceText, selectionStart, selectionEnd);

      expect(result.lines[0].linePrefix).toBe('## ');
      expect(result.lines[0].linePrefixType).toBe('heading');
      expect(result.lines[0].contentStartOffset).toBe(3);
    });

    it('detects todo prefix', () => {
      const sourceText = '- [ ] task text';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('- [ ] ');
      expect(result.lines[0].linePrefixType).toBe('todo');
      expect(result.lines[0].contentStartOffset).toBe(6);
    });

    it('detects bullet prefix', () => {
      const sourceText = '- item';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('- ');
      expect(result.lines[0].linePrefixType).toBe('bullet');
    });

    it('detects numbered prefix', () => {
      const sourceText = '1. item';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('1. ');
      expect(result.lines[0].linePrefixType).toBe('numbered');
    });

    it('detects nested bullet prefix with leading whitespace', () => {
      const sourceText = '  - nested';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('  - ');
      expect(result.lines[0].linePrefixType).toBe('bullet');
    });

    it('detects callout prefix', () => {
      const sourceText = '> callout body';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('> ');
      expect(result.lines[0].linePrefixType).toBe('callout');
    });

    it('detects footnote definition prefix', () => {
      const sourceText = '[^1]: definition';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('[^1]: ');
      expect(result.lines[0].linePrefixType).toBe('footnoteDefinition');
    });

    it('detects indent-only prefix', () => {
      const sourceText = '    continuation text';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('    ');
      expect(result.lines[0].linePrefixType).toBe('indent');
    });

    it('detects multiple lines each with their own prefix', () => {
      const sourceText = '- item1\n- item2';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].linePrefixType).toBe('bullet');
      expect(result.lines[0].linePrefix).toBe('- ');
      expect(result.lines[1].linePrefixType).toBe('bullet');
      expect(result.lines[1].linePrefix).toBe('- ');
    });

    it('detects mixed prefixes across multiple lines', () => {
      const sourceText = '## Heading\n- item';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].linePrefixType).toBe('heading');
      expect(result.lines[0].linePrefix).toBe('## ');
      expect(result.lines[1].linePrefixType).toBe('bullet');
      expect(result.lines[1].linePrefix).toBe('- ');
    });
  });

  // ============================================================
  // Composite Prefix Detection
  // ============================================================

  describe('composite prefix detection', () => {

    it('detects callout wrapping a todo prefix', () => {
      const sourceText = '> - [ ] task';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('> - [ ] ');
      expect(result.lines[0].linePrefixType).toBe('todo');
    });

    it('detects callout wrapping a bullet prefix', () => {
      const sourceText = '> - item';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines[0].linePrefix).toBe('> - ');
      expect(result.lines[0].linePrefixType).toBe('bullet');
    });
  });

  // ============================================================
  // Atomic Token Scan
  // ============================================================

  describe('atomic token scan', () => {

    it('detects a wikilink as a protected range', () => {
      const sourceText = 'Visit [[Note]] here';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.protectedRanges).toHaveLength(1);
      expect(result.protectedRanges[0]).toEqual({
        startOffset: 6,
        endOffset: 14,
        tokenType: 'wikilink',
      });
    });

    it('detects an md link and a hashtag as separate protected ranges', () => {
      const sourceText = 'See [link](url) and #tag';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.protectedRanges).toHaveLength(2);

      const mdLinkRange = result.protectedRanges.find((range) => range.tokenType === 'mdLink');
      expect(mdLinkRange).toBeDefined();
      expect(mdLinkRange!.startOffset).toBe(4);
      expect(mdLinkRange!.endOffset).toBe(15);

      const hashtagRange = result.protectedRanges.find((range) => range.tokenType === 'hashtag');
      expect(hashtagRange).toBeDefined();
      expect(hashtagRange!.startOffset).toBe(20);
      expect(hashtagRange!.endOffset).toBe(24);
    });

    it('detects an embed as a protected range', () => {
      const sourceText = '![[embed]]';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.protectedRanges).toHaveLength(1);
      expect(result.protectedRanges[0]).toEqual({
        startOffset: 0,
        endOffset: 10,
        tokenType: 'embed',
      });
    });

    it('detects a footnote reference as a protected range', () => {
      const sourceText = 'Check [^1] ref';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.protectedRanges).toHaveLength(1);
      expect(result.protectedRanges[0]).toEqual({
        startOffset: 6,
        endOffset: 10,
        tokenType: 'footnoteRef',
      });
    });

    it('deduplicates embed vs wikilink — only embed is kept', () => {
      const sourceText = '![[embed]]';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      // Embed is scanned first and claims the range; wikilink skipped due to overlap
      expect(result.protectedRanges).toHaveLength(1);
      expect(result.protectedRanges[0].tokenType).toBe('embed');
    });
  });

  // ============================================================
  // Full Integration
  // ============================================================

  describe('full integration', () => {

    it('returns correct structure for plain text with no special elements', () => {
      const sourceText = 'simple text';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result).toEqual({
        lines: [{
          lineStartOffset: 0,
          lineEndOffset: 11,
          linePrefix: null,
          linePrefixType: 'none',
          contentStartOffset: 0,
          inertZone: null,
        }],
        protectedRanges: [],
        isFullyInert: false,
      });
    });

    it('handles a selection in the middle of a line correctly expanding to full line', () => {
      const sourceText = '## My Heading';
      // Selection is just "My" (offsets 3..5)
      const result = detectStructureContext(sourceText, 3, 5);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].lineStartOffset).toBe(0);
      expect(result.lines[0].lineEndOffset).toBe(13);
      expect(result.lines[0].linePrefix).toBe('## ');
      expect(result.lines[0].linePrefixType).toBe('heading');
    });

    it('handles a multi-line selection with mixed content and tokens', () => {
      const sourceText = '- Visit [[Note]] here\n## Title';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].linePrefixType).toBe('bullet');
      expect(result.lines[1].linePrefixType).toBe('heading');

      // Wikilink in first line — offset relative to selection start
      expect(result.protectedRanges).toHaveLength(1);
      expect(result.protectedRanges[0].tokenType).toBe('wikilink');
      expect(result.protectedRanges[0].startOffset).toBe(8);
      expect(result.protectedRanges[0].endOffset).toBe(16);
    });

    it('sets isFullyInert false when only some lines are inert', () => {
      const sourceText = 'normal text\n---';
      const result = detectStructureContext(sourceText, 0, sourceText.length);

      expect(result.isFullyInert).toBe(false);

      // First line is normal
      expect(result.lines[0].inertZone).toBeNull();

      // Second line is a horizontal rule
      expect(result.lines[1].inertZone).toBe('horizontalRule');
    });
  });
});
