import type { TTagType } from '../../interfaces';
import type { TagPosition } from '../interfaces';

export type TMatchRecord = {
  title?: string[];
  type: TTagType;
  isHTML: boolean;
  open?: TagPosition;
  close?: TagPosition;
};

export type TMatchFilter = (content: string, matches: TMatchRecord[]) => TMatchRecord[];
