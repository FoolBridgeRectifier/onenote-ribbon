import type { App, TFile } from 'obsidian';
import { Component, MarkdownRenderer } from 'obsidian';

import { INLINE_STYLE_PROPERTIES } from '../../constants';
import { escapeHtmlEntities } from '../markdown-converter/MarkdownConverter';

/**
 * Walks every descendant element of `root` and writes its live computed CSS
 * values as inline styles. This makes the HTML self-contained — the isolated
 * BrowserWindow used for PDF generation needs no external stylesheet.
 */
function inlineComputedStylesOnAllElements(root: HTMLElement): void {
  const elements = root.querySelectorAll('*');
  for (const element of Array.from(elements)) {
    const computed = window.getComputedStyle(element as HTMLElement);
    const styleEntries: string[] = [];

    for (const property of INLINE_STYLE_PROPERTIES) {
      const value = computed.getPropertyValue(property);
      if (value !== '') {
        styleEntries.push(`${property}:${value}`);
      }
    }

    (element as HTMLElement).style.cssText = styleEntries.join(';');
  }
}

/**
 * Renders markdown using Obsidian's own MarkdownRenderer into a hidden
 * off-screen container, inlines all computed CSS values onto every element,
 * strips Obsidian UI chrome (collapse indicators, metadata header), and returns
 * a complete self-contained HTML document ready for Electron's printToPDF.
 *
 * Because styles are inlined from live computed values, the PDF will match
 * exactly what Obsidian's reading view displays for the active theme.
 */
export async function buildObsidianHtml(
  app: App,
  markdown: string,
  noteTitle: string,
  file: TFile | null
): Promise<string> {
  // Render in a hidden off-screen container so getComputedStyle returns live values
  const container = document.createElement('div');
  container.className = 'markdown-preview-view markdown-rendered';
  // 800px matches a typical readable-line-width in Obsidian
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;visibility:hidden;';
  document.body.appendChild(container);

  const component = new Component();
  component.load();

  const filePath = file?.path ?? '';
  await MarkdownRenderer.render(app, markdown, container, filePath, component);

  // Wait a tick for any async rendering (embeds, live-preview plugins) to settle
  await new Promise<void>((resolve) => setTimeout(resolve, 100));

  // Remove Obsidian UI chrome that has no place in a printed PDF
  const obsidianUiSelectors = [
    '.markdown-preview-pusher',
    '.mod-header',
    '.heading-collapse-indicator',
    '.list-collapse-indicator',
    '.collapse-indicator',
    '.metadata-container',
  ];
  for (const selector of obsidianUiSelectors) {
    container.querySelectorAll(selector).forEach((element) => element.remove());
  }

  // Snapshot computed styles onto every element before leaving the Obsidian context
  inlineComputedStylesOnAllElements(container);

  const bodyHtml = container.innerHTML;

  component.unload();
  document.body.removeChild(container);

  const escapedTitle = escapeHtmlEntities(noteTitle);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapedTitle}</title>
  <style>
    body {
      /* Safe system font stack — Obsidian's custom fonts are not available
         in the isolated PDF BrowserWindow */
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui,
        "Segoe UI", Roboto, Inter, sans-serif;
      margin: 20px;
      padding: 0;
      max-width: 800px;
    }
    /* Hide any residual interactive Obsidian UI elements */
    .collapse-indicator, .list-collapse-indicator { display: none; }
    /* Keep SVG callout icons from overflowing their containers */
    svg { max-width: 1em; height: auto; vertical-align: middle; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}
