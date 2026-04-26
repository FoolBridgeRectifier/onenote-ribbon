import type { HtmlTagDefinition } from '../interfaces';

/** A single markdown delimiter pair → HTML tags conversion entry. */
export interface MarkdownToHtmlConversionEntry {
  markdownOpening: string;
  markdownClosing: string;
  htmlTags: HtmlTagDefinition[];
}
