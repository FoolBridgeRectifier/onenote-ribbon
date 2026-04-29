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
}

export enum ELineTagType {
  LIST = 'LIST',
  HEADING = 'HEADING',
  QUOTE = 'QUOTE',
  INDENT = 'INDENT',
  CHECKBOX = 'CHECKBOX',
  CALLOUT = 'CALLOUT',
}

export enum ESpecialTagType {
  CODE = 'CODE',
  INLINE_TODO = 'INLINE_TODO',
  MEETING_DETAILS = 'MEETING_DETAILS',
  WIKILINK = 'WIKILINK ',
  EMBED = 'EMBED',
  MD_LINK = 'MD_LINK',
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
  isSpan: false;
  isProtected: false;
}

export interface IHtmlStyleTag {
  type: EHtmlStyleTagType;
  open: TagPosition;
  close: TagPosition;
  isHTML: true;
  isSpan: false;
  isProtected: false;
}

export interface ISpanStyleTag {
  type: ESpanStyleTagType;
  open: TagPosition;
  close: TagPosition;
  isHTML: true;
  isSpan: true;
  isProtected: false;
}

export interface ILineStyleTag {
  type: ELineTagType;
  open: TagPosition;
  isHTML: false;
  isSpan: false;
  isProtected: true;
}

export interface ISpecialTag {
  type: ESpecialTagType;
  open: TagPosition;
  close?: TagPosition;
  isHTML: false;
  isSpan: false;
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
