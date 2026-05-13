import type { TTagType, TagPosition } from '../../../interfaces';

export type TMatchRecord = {
  title?: string[];
  type: TTagType;
  isHTML: boolean;
  open?: TagPosition;
  close?: TagPosition;
};
