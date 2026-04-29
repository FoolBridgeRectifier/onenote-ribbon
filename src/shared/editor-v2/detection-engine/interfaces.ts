import type { EditorPosition } from 'obsidian';

export interface TagPosition {
  start: EditorPosition;
  end: EditorPosition;
}

export type TagType = string;

export interface DetectedTag {
  type: TagType;
  isHTML?: boolean;
  isSpan?: boolean;
  open?: TagPosition;
  close?: TagPosition;
  spanValue?: string;
}

export interface ProtectedRange {
  startOffset: number;
  endOffset: number;
  tokenType: string;
}

export interface TagContext {
  tags: DetectedTag[];
  protectedRanges: ProtectedRange[];
  content: string;
}

export interface ActiveTagsResult {
  enclosingTags: DetectedTag[];
  lineTag: DetectedTag | null;
  insertionFormat: 'markdown' | 'html';
}

export interface LinePrefixResult {
  tag: DetectedTag | null;
  contentStartCh: number;
}

export interface HtmlOpenerMatch {
  openEndCh: number;
  styleAttribute?: string;
}

export interface HtmlCloserMatch {
  closeStart: number;
  closeEnd: number;
}
