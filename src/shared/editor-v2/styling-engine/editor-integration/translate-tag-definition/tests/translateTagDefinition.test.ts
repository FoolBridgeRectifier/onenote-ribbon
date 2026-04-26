import { translateHtmlTagDefinitionToV2 } from '../translateTagDefinition';

describe('translateHtmlTagDefinitionToV2', () => {
  // === HTML element shorthand → v2 type with isHTML flag ===

  it('translates <b> domain=html → bold isHTML', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'b', domain: 'html', openingMarkup: '<b>', closingMarkup: '</b>',
    });
    expect(result).toEqual({ type: 'bold', isHTML: true });
  });

  it('translates <i> domain=html → italic isHTML', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'i', domain: 'html', openingMarkup: '<i>', closingMarkup: '</i>',
    });
    expect(result).toEqual({ type: 'italic', isHTML: true });
  });

  it('translates <s> domain=html → strikethrough isHTML', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 's', domain: 'html', openingMarkup: '<s>', closingMarkup: '</s>',
    });
    expect(result).toEqual({ type: 'strikethrough', isHTML: true });
  });

  it('translates <u> domain=html → underline isHTML', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'u', domain: 'html', openingMarkup: '<u>', closingMarkup: '</u>',
    });
    expect(result).toEqual({ type: 'underline', isHTML: true });
  });

  it('translates <sub> domain=html → subscript isHTML', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'sub', domain: 'html', openingMarkup: '<sub>', closingMarkup: '</sub>',
    });
    expect(result).toEqual({ type: 'subscript', isHTML: true });
  });

  it('translates <sup> domain=html → superscript isHTML', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'sup', domain: 'html', openingMarkup: '<sup>', closingMarkup: '</sup>',
    });
    expect(result).toEqual({ type: 'superscript', isHTML: true });
  });

  // === Markdown words → v2 plain MD tag ===

  it('translates bold domain=markdown → { type: bold }', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'bold', domain: 'markdown', openingMarkup: '**', closingMarkup: '**',
    });
    expect(result).toEqual({ type: 'bold' });
  });

  it('translates italic domain=markdown → { type: italic }', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'italic', domain: 'markdown', openingMarkup: '*', closingMarkup: '*',
    });
    expect(result).toEqual({ type: 'italic' });
  });

  it('translates strikethrough domain=markdown → { type: strikethrough }', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'strikethrough', domain: 'markdown', openingMarkup: '~~', closingMarkup: '~~',
    });
    expect(result).toEqual({ type: 'strikethrough' });
  });

  it('translates highlight domain=markdown → { type: highlight }', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'highlight', domain: 'markdown', openingMarkup: '==', closingMarkup: '==',
    });
    expect(result).toEqual({ type: 'highlight' });
  });

  it('translates code domain=markdown → { type: code }', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'code', domain: 'markdown', openingMarkup: '`', closingMarkup: '`',
    });
    expect(result).toEqual({ type: 'code' });
  });

  // === Span tags with attributes → isSpan + spanValue ===

  it('translates span color → color isSpan with value', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="color:#ff0000">', closingMarkup: '</span>',
      attributes: { color: '#ff0000' },
    });
    expect(result).toEqual({ type: 'color', isSpan: true, spanValue: '#ff0000' });
  });

  it('translates span background → highlight isSpan with value', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="background:#ffff00">', closingMarkup: '</span>',
      attributes: { background: '#ffff00' },
    });
    expect(result).toEqual({ type: 'highlight', isSpan: true, spanValue: '#ffff00' });
  });

  it('translates span font-family → fontFamily isSpan with value', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="font-family:Arial">', closingMarkup: '</span>',
      attributes: { 'font-family': 'Arial' },
    });
    expect(result).toEqual({ type: 'fontFamily', isSpan: true, spanValue: 'Arial' });
  });

  it('translates span font-size → fontSize isSpan with value', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="font-size:14pt">', closingMarkup: '</span>',
      attributes: { 'font-size': '14pt' },
    });
    expect(result).toEqual({ type: 'fontSize', isSpan: true, spanValue: '14pt' });
  });

  it('translates span text-align → align isSpan with value', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="text-align:center">', closingMarkup: '</span>',
      attributes: { 'text-align': 'center' },
    });
    expect(result).toEqual({ type: 'align', isSpan: true, spanValue: 'center' });
  });

  it('translates span margin-left → indent isSpan with value', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="margin-left:24px">', closingMarkup: '</span>',
      attributes: { 'margin-left': '24px' },
    });
    expect(result).toEqual({ type: 'indent', isSpan: true, spanValue: '24px' });
  });

  // === Span fallbacks ===

  it('falls back to highlight isSpan when span has no attributes', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span>', closingMarkup: '</span>',
    });
    expect(result).toEqual({ type: 'highlight', isSpan: true });
  });

  it('falls back to color type for unknown CSS property', () => {
    const result = translateHtmlTagDefinitionToV2({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="border:1px">', closingMarkup: '</span>',
      attributes: { border: '1px' },
    });
    expect(result).toEqual({ type: 'color', isSpan: true, spanValue: '1px' });
  });
});
