/** Subject prefix prepended to the note title when composing the email. */
export const EMAIL_SUBJECT_PREFIX = 'Note: ' as const;

/** MIME multipart boundary token used in generated EML files. */
export const EML_BOUNDARY = 'onenote-ribbon-v1' as const;

/** CSS applied inside the exported HTML page for print-friendly markdown rendering. */
export const NOTE_EXPORT_STYLES = `
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1 { font-size: 2em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; margin-top: 1em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
  h3 { font-size: 1.25em; }
  h4, h5, h6 { font-size: 1em; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  del { text-decoration: line-through; }
  code {
    background: #f0f0f0;
    padding: 0.15em 0.3em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }
  pre {
    background: #f0f0f0;
    padding: 1em;
    overflow: auto;
    border-radius: 4px;
  }
  pre code { background: none; padding: 0; }
  blockquote {
    border-left: 3px solid #ccc;
    margin: 0.5em 0;
    padding-left: 1em;
    color: #555;
  }
  ul, ol { padding-left: 2em; }
  li { margin: 0.25em 0; }
  hr { border: none; border-top: 1px solid #ccc; margin: 1.5em 0; }
  a { color: #0066cc; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
  th { background: #f5f5f5; font-weight: 700; }
  mark { background: #ffff00; }
  p { margin: 0.5em 0; }
` as const;
