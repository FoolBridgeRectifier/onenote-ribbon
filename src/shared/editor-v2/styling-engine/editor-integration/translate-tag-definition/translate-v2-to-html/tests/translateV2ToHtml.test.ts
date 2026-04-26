import { translateV2ToHtml } from '../translateV2ToHtml';

describe('translateV2ToHtml', () => {
  // === Empty input ===

  it('returns [] for empty input', () => {
    expect(translateV2ToHtml([])).toEqual([]);
  });

  // === Plain markdown tags ===

  it('translates { type: bold } → markdown ** delimiters', () => {
    const result = translateV2ToHtml([{ type: 'bold' }]);
    expect(result).toEqual([{
      tagName: 'bold', domain: 'markdown', openingMarkup: '**', closingMarkup: '**',
    }]);
  });

  it('translates { type: italic } → markdown * delimiters', () => {
    const result = translateV2ToHtml([{ type: 'italic' }]);
    expect(result[0].openingMarkup).toBe('*');
  });

  it('translates { type: code } → markdown ` delimiters', () => {
    const result = translateV2ToHtml([{ type: 'code' }]);
    expect(result[0].openingMarkup).toBe('`');
  });

  it('translates { type: strikethrough } → markdown ~~ delimiters', () => {
    const result = translateV2ToHtml([{ type: 'strikethrough' }]);
    expect(result[0].openingMarkup).toBe('~~');
  });

  it('translates { type: highlight } → markdown == delimiters', () => {
    const result = translateV2ToHtml([{ type: 'highlight' }]);
    expect(result[0].openingMarkup).toBe('==');
  });

  // === HTML element shorthand ===

  it('translates { type: bold, isHTML: true } → <b>', () => {
    const result = translateV2ToHtml([{ type: 'bold', isHTML: true }]);
    expect(result).toEqual([{
      tagName: 'b', domain: 'html', openingMarkup: '<b>', closingMarkup: '</b>',
    }]);
  });

  it('translates { type: subscript, isHTML: true } → <sub>', () => {
    const result = translateV2ToHtml([{ type: 'subscript', isHTML: true }]);
    expect(result[0].tagName).toBe('sub');
  });

  it('translates { type: superscript, isHTML: true } → <sup>', () => {
    const result = translateV2ToHtml([{ type: 'superscript', isHTML: true }]);
    expect(result[0].tagName).toBe('sup');
  });

  it('translates { type: underline, isHTML: true } → <u>', () => {
    const result = translateV2ToHtml([{ type: 'underline', isHTML: true }]);
    expect(result[0].tagName).toBe('u');
  });

  it('translates { type: highlight, isHTML: true } → <mark>', () => {
    const result = translateV2ToHtml([{ type: 'highlight', isHTML: true }]);
    expect(result[0].tagName).toBe('mark');
  });

  // === Span tags with spanValue ===

  it('translates { type: color, isSpan, spanValue: #ff0000 }', () => {
    const result = translateV2ToHtml([{ type: 'color', isSpan: true, spanValue: '#ff0000' }]);
    expect(result).toEqual([{
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="color:#ff0000">', closingMarkup: '</span>',
      attributes: { color: '#ff0000' },
    }]);
  });

  it('translates { type: highlight, isSpan, spanValue: #ffff00 } → background CSS property', () => {
    const result = translateV2ToHtml([{ type: 'highlight', isSpan: true, spanValue: '#ffff00' }]);
    expect(result[0].attributes).toEqual({ background: '#ffff00' });
  });

  it('translates { type: fontSize, isSpan, spanValue: 14pt } → font-size CSS property', () => {
    const result = translateV2ToHtml([{ type: 'fontSize', isSpan: true, spanValue: '14pt' }]);
    expect(result[0].attributes).toEqual({ 'font-size': '14pt' });
  });

  it('translates span without spanValue → empty value', () => {
    const result = translateV2ToHtml([{ type: 'fontSize', isSpan: true }]);
    expect(result[0].attributes).toEqual({ 'font-size': '' });
  });

  // === Multiple tags preserved ===

  it('preserves order across mixed inputs', () => {
    const result = translateV2ToHtml([
      { type: 'bold' },
      { type: 'italic', isHTML: true },
      { type: 'color', isSpan: true, spanValue: '#000' },
    ]);
    expect(result.map((tagDefinition) => tagDefinition.tagName)).toEqual(['bold', 'i', 'span']);
  });
});
