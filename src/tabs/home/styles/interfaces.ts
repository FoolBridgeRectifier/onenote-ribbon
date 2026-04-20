/** A single entry in the Styles picker (heading, quote, or code). */
export interface StyleEntry {
  name: string;
  level: number;
  type?: 'quote' | 'code';
}
