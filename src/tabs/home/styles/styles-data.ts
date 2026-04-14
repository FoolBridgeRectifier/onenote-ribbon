/**
 * Styles list for the Styles group.
 * Each style has a name and either a heading level or a type discriminator.
 */
export interface StyleEntry {
  name: string;
  level: number;
  type?: 'quote' | 'code';
}

export const STYLES_LIST: StyleEntry[] = [
  { name: 'Normal', level: 0 },
  { name: 'Heading 1', level: 1 },
  { name: 'Heading 2', level: 2 },
  { name: 'Heading 3', level: 3 },
  { name: 'Heading 4', level: 4 },
  { name: 'Heading 5', level: 5 },
  { name: 'Heading 6', level: 6 },
  { name: 'Quote', level: 0, type: 'quote' },
  { name: 'Code', level: 0, type: 'code' },
];
