import { MarkdownTagPatternDefinition } from './interfaces';

export const NEWLINE_DELIMITER = '\n';
export const CLOSING_TAG_PREFIX = '</';

export const HTML_TAG_PATTERN_SOURCE = '<\\/?([A-Za-z][A-Za-z0-9:-]*)\\b[^>]*>';
export const HTML_TAG_PATTERN_FLAGS = 'g';

export const MARKDOWN_TAG_PATTERN_FLAGS = 'g';

export const MARKDOWN_TAG_PATTERN_DEFINITIONS: MarkdownTagPatternDefinition[] =
  [
    // Combined bold+italic *** must come before separate ** and * patterns
    // so the triple-asterisk is matched as a unit rather than partially consumed.
    // Bold claims the outer 2 asterisks; italic claims the inner 1.
    {
      tagName: 'bold',
      patternSource: '\\*\\*\\*(?=\\S)([\\s\\S]*?\\S)\\*\\*\\*',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 2,
      closingDelimiterLength: 2,
    },
    {
      tagName: 'italic',
      patternSource: '\\*\\*\\*(?=\\S)([\\s\\S]*?\\S)\\*\\*\\*',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 1,
      closingDelimiterLength: 1,
      delimiterInset: 2,
    },
    {
      tagName: 'bold',
      patternSource: '(?<!\\*)\\*\\*(?!\\*)(?=\\S)([\\s\\S]*?\\S)(?<!\\*)\\*\\*(?!\\*)',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 2,
      closingDelimiterLength: 2,
    },
    {
      tagName: 'bold',
      patternSource: '__(?=\\S)([\\s\\S]*?\\S)__',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 2,
      closingDelimiterLength: 2,
    },
    {
      tagName: 'italic',
      patternSource:
        '(?<!\\*)\\*(?!\\*)(?=\\S)([\\s\\S]*?\\S)(?<!\\*)\\*(?!\\*)',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 1,
      closingDelimiterLength: 1,
    },
    {
      tagName: 'italic',
      patternSource: '(?<!_)_(?!_)(?=\\S)([\\s\\S]*?\\S)(?<!_)_(?!_)',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 1,
      closingDelimiterLength: 1,
    },
    {
      tagName: 'strikethrough',
      patternSource: '~~(?=\\S)([\\s\\S]*?\\S)~~',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 2,
      closingDelimiterLength: 2,
    },
    {
      tagName: 'highlight',
      patternSource: '==(?=\\S)([\\s\\S]*?\\S)==',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 2,
      closingDelimiterLength: 2,
    },
    {
      tagName: 'code',
      patternSource: '`([^`\\n]+)`',
      patternFlags: MARKDOWN_TAG_PATTERN_FLAGS,
      openingDelimiterLength: 1,
      closingDelimiterLength: 1,
    },
  ];

export const SELF_CLOSING_TAG_END_PATTERN = /\/\s*>$/;

export const VOID_HTML_TAG_NAMES = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
