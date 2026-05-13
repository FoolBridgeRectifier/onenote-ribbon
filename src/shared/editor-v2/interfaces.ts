import type { EditorPosition } from 'obsidian';

export enum EMdStyleTagType {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  STRIKETHROUGH = 'STRIKETHROUGH',
  HIGHLIGHT = 'HIGHLIGHT',
}

export enum EHtmlStyleTagType {
  UNDERLINE = 'UNDERLINE',
  SUBSCRIPT = 'SUBSCRIPT',
  SUPERSCRIPT = 'SUPERSCRIPT',
}

export enum ESpanStyleTagType {
  COLOR = 'COLOR',
  FONT_SIZE = 'FONT_SIZE',
  FONT_FAMILY = 'FONT_FAMILY',
  HIGHLIGHT = 'HIGHLIGHT',
  ALIGN = 'ALIGN',
  // Catch-all for any <span> whose CSS is not tracked by a specific entry above.
  // Used internally by matchSpanTags for stack-based untracked-span detection.
  GENERIC = 'GENERIC_SPAN',
}

export enum ELineTagType {
  LIST = 'LIST',
  HEADING = 'HEADING',
  QUOTE = 'QUOTE',
  INDENT = 'INDENT',
  CHECKBOX = 'CHECKBOX',
  CALLOUT = 'CALLOUT',
  DIVIDER = 'DIVIDER',
}

export enum ESpecialTagType {
  BLOCK_CODE = 'BLOCK_CODE',
  INLINE_CODE = 'INLINE_CODE',
  LINE_CODE = 'LINE_CODE',
  HASHTAG = 'HASHTAG',
  MEETING_DETAILS = 'MEETING_DETAILS',
  WIKILINK = 'WIKILINK',
  EMBED = 'EMBED',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  FOOTNOTE_REF = 'FOOTNOTE_REF',
}

export interface TagPosition {
  start: EditorPosition;
  end: EditorPosition;
}

export interface IMdStyleTag {
  type: EMdStyleTagType;
  open: TagPosition;
  close: TagPosition;
  isHTML?: boolean;
  isProtected: false;
}

export interface IHtmlStyleTag {
  type: EHtmlStyleTagType;
  open: TagPosition;
  close: TagPosition;
  isHTML: true;
  isProtected: false;
}

export interface ISpanStyleTag {
  type: ESpanStyleTagType;
  open: TagPosition;
  close: TagPosition;
  isHTML: true;
  isProtected: false;
}

export interface ILineStyleTag {
  title?: string[];
  type: ELineTagType;
  open: TagPosition;
  isHTML: false;
  isProtected: true;
}

export interface ISpecialTag {
  title?: string[];
  type: ESpecialTagType;
  open?: TagPosition;
  close?: TagPosition;
  isHTML: false;
  isProtected: true;
}

export type TTag = IMdStyleTag | IHtmlStyleTag | ISpanStyleTag | ILineStyleTag | ISpecialTag;

export type TTagType =
  | EMdStyleTagType
  | EHtmlStyleTagType
  | ESpanStyleTagType
  | ELineTagType
  | ESpecialTagType;

export type TCursor = EditorPosition | { start: EditorPosition; end: EditorPosition };
