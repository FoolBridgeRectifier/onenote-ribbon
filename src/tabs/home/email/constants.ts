/** Subject prefix prepended to the note title when composing the email. */
export const EMAIL_SUBJECT_PREFIX = 'Note: ' as const;

/** MIME multipart boundary token used in generated EML files. */
export const EML_BOUNDARY = 'onenote-ribbon-v1' as const;

/** Milliseconds to wait after opening an EML file before deleting it from disk. */
export const EML_DELETE_DELAY_MS = 5000 as const;

/** Generic email body text for PDF-attached emails (no note content). */
export const EMAIL_BODY_TEXT = `Your note is attached and ready to share.

Hope this makes your day a little brighter.` as const;

/**
 * CSS applied inside the exported HTML page for print-friendly markdown rendering.
 * All values are derived from Obsidian's live computed styles (captured via DevTools),
 * scaled to 12pt base for print output while preserving exact proportional relationships.
 *
 * Obsidian base: 24px screen → 12pt print (0.5× scale), ratios kept identical.
 * Captured 2026-04-17 using Obsidian 1.12.7, default theme (light mode).
 */
export const NOTE_EXPORT_STYLES = `
  body {
    /* ui-sans-serif matches Obsidian's Inter Variable / Segoe UI stack */
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, Inter, sans-serif;
    font-size: 12pt;
    /* Obsidian line-height: 36/24 = 1.5 */
    line-height: 1.5;
    /* Obsidian text color: rgb(34, 34, 34) */
    color: #222222;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Headings: font-sizes are exact ratios from Obsidian (px / 24 base).
     No border-bottom — Obsidian renders headings without any separator line. */
  h1 { font-size: 1.618em; font-weight: 700;  line-height: 1.2; margin: 1.5em 0 1em; }
  h2 { font-size: 1.462em; font-weight: 680;  line-height: 1.2; margin: 1em 0; }
  h3 { font-size: 1.318em; font-weight: 660;  line-height: 1.3; margin: 1em 0; }
  h4 { font-size: 1.188em; font-weight: 640;  line-height: 1.4; margin: 1em 0; }
  h5, h6 { font-size: 1em; font-weight: 620; margin: 1em 0; }

  /* Obsidian p margin: 24px top + bottom at 24px base = 1em each side */
  p { margin: 1em 0; }

  /* strong font-weight in Obsidian is 600, not 700 */
  strong { font-weight: 600; }
  em { font-style: italic; }
  del { text-decoration: line-through; }

  code {
    /* Obsidian code: bg #fafafa, padding 3.15px/6.3px at 24px base ≈ 0.13/0.26em */
    background: #fafafa;
    padding: 0.13em 0.26em;
    border-radius: 4px;
    font-family: ui-monospace, "Cascadia Code", "Fira Mono", Consolas, monospace;
    /* Obsidian code font-size: 21/24 = 0.875em */
    font-size: 0.875em;
  }

  pre {
    /* Obsidian pre: bg #fafafa, padding 12px top / 16px left at 24px base */
    background: #fafafa;
    padding: 0.5em 0.667em;
    border-radius: 4px;
    margin: 1em 0;
    overflow: auto;
  }
  pre code { background: none; padding: 0; font-size: 1em; }

  blockquote {
    /* Obsidian blockquote: 1.71px solid purple left border, no background */
    border-left: 1.71px solid rgb(152, 115, 247);
    margin: 1em 0;
    padding-left: 1em;
    color: #222222;
  }

  ul, ol { padding-left: 2em; }
  /* Obsidian li: padding-top/bottom 1.8px at 24px base ≈ 0.075em, no margin */
  li { margin: 0; padding: 0.075em 0; }

  /* Obsidian hr: border-top color rgb(224, 224, 224), margin-top 48px = 2em */
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 2em 0; }

  /* Obsidian link color: rgb(138, 92, 245) — same purple as accent */
  a { color: rgb(138, 92, 245); text-decoration: underline; }

  /* Obsidian mark: rgba(255, 208, 0, 0.4) — warm yellow with transparency */
  mark { background: rgba(255, 208, 0, 0.4); }

  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e0e0e0; padding: 0.5em; text-align: left; }
  /* Obsidian th: bg #fafafa, font-weight 600 */
  th { background: #fafafa; font-weight: 600; }
` as const;


/**
 * Inline CSS properties transferred to the standalone PDF HTML.
 * Skips font-family to avoid references to Obsidian-only fonts.
 */
export const INLINE_STYLE_PROPERTIES = [
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'color',
  'background-color',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-left-width',
  'border-left-color',
  'border-left-style',
  'border-top-width',
  'border-top-color',
  'border-top-style',
  'text-decoration',
  'text-align',
  'border-radius',
  'display',
  'vertical-align',
] as const;
