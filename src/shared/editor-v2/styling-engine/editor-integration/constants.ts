import type { HtmlTagDefinition } from './interfaces';

/**
 * Legacy {@link HtmlTagDefinition} constants re-homed under the v2 adapter
 * so buttons can import them without touching the old engine path.
 */

export const UNDERLINE_TAG: HtmlTagDefinition = {
  tagName: 'u', domain: 'html',
  openingMarkup: '<u>', closingMarkup: '</u>',
};

export const SUBSCRIPT_TAG: HtmlTagDefinition = {
  tagName: 'sub', domain: 'html',
  openingMarkup: '<sub>', closingMarkup: '</sub>',
};

export const SUPERSCRIPT_TAG: HtmlTagDefinition = {
  tagName: 'sup', domain: 'html',
  openingMarkup: '<sup>', closingMarkup: '</sup>',
};

export const BOLD_MD_TAG: HtmlTagDefinition = {
  tagName: 'bold', domain: 'markdown',
  openingMarkup: '**', closingMarkup: '**',
};

export const ITALIC_MD_TAG: HtmlTagDefinition = {
  tagName: 'italic', domain: 'markdown',
  openingMarkup: '*', closingMarkup: '*',
};

export const STRIKETHROUGH_MD_TAG: HtmlTagDefinition = {
  tagName: 'strikethrough', domain: 'markdown',
  openingMarkup: '~~', closingMarkup: '~~',
};

export const HIGHLIGHT_MD_TAG: HtmlTagDefinition = {
  tagName: 'highlight', domain: 'markdown',
  openingMarkup: '==', closingMarkup: '==',
};

export const BOLD_HTML_TAG: HtmlTagDefinition = {
  tagName: 'b', domain: 'html',
  openingMarkup: '<b>', closingMarkup: '</b>',
};

export const ITALIC_HTML_TAG: HtmlTagDefinition = {
  tagName: 'i', domain: 'html',
  openingMarkup: '<i>', closingMarkup: '</i>',
};

export const STRIKETHROUGH_HTML_TAG: HtmlTagDefinition = {
  tagName: 's', domain: 'html',
  openingMarkup: '<s>', closingMarkup: '</s>',
};

export const HIGHLIGHT_HTML_TAG: HtmlTagDefinition = {
  tagName: 'mark', domain: 'html',
  openingMarkup: '<mark>', closingMarkup: '</mark>',
};
