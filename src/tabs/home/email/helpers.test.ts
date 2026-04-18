import {
  buildEmlContent,
  buildEmlWithPdfAttachment,
  buildNoteHtml,
  convertMarkdownToHtmlBody,
  sendNoteByEmail,
  stripMarkdownToPlainText,
} from './helpers';
import type { SendNoteByEmailDependencies } from './interfaces';

// ── convertMarkdownToHtmlBody ─────────────────────────────────────────────────

describe('convertMarkdownToHtmlBody', () => {
  it('converts h1 through h6 ATX headings', () => {
    const result = convertMarkdownToHtmlBody(
      '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6',
    );
    expect(result).toContain('<h1>H1</h1>');
    expect(result).toContain('<h2>H2</h2>');
    expect(result).toContain('<h3>H3</h3>');
    expect(result).toContain('<h4>H4</h4>');
    expect(result).toContain('<h5>H5</h5>');
    expect(result).toContain('<h6>H6</h6>');
  });

  it('wraps plain text lines in paragraph tags', () => {
    const result = convertMarkdownToHtmlBody('Hello world');
    expect(result).toContain('<p>Hello world</p>');
  });

  it('preserves empty lines as blank separators', () => {
    const result = convertMarkdownToHtmlBody('Line one\n\nLine two');
    expect(result).toContain('<p>Line one</p>');
    expect(result).toContain('<p>Line two</p>');
  });

  it('converts **bold** to strong elements', () => {
    const result = convertMarkdownToHtmlBody('**bold text**');
    expect(result).toContain('<strong>bold text</strong>');
  });

  it('converts __bold__ to strong elements', () => {
    const result = convertMarkdownToHtmlBody('__bold text__');
    expect(result).toContain('<strong>bold text</strong>');
  });

  it('converts *italic* to em elements', () => {
    const result = convertMarkdownToHtmlBody('*italic text*');
    expect(result).toContain('<em>italic text</em>');
  });

  it('converts _italic_ to em elements', () => {
    const result = convertMarkdownToHtmlBody('_italic text_');
    expect(result).toContain('<em>italic text</em>');
  });

  it('converts ~~strikethrough~~ to del elements', () => {
    const result = convertMarkdownToHtmlBody('~~struck text~~');
    expect(result).toContain('<del>struck text</del>');
  });

  it('converts `inline code` to code elements', () => {
    const result = convertMarkdownToHtmlBody('use `myFunc()` here');
    expect(result).toContain('<code>myFunc()</code>');
  });

  it('converts ==highlights== to mark elements', () => {
    const result = convertMarkdownToHtmlBody('==highlighted==');
    expect(result).toContain('<mark>highlighted</mark>');
  });

  it('converts unordered list items with - to ul/li', () => {
    const result = convertMarkdownToHtmlBody('- item one\n- item two');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>item one</li>');
    expect(result).toContain('<li>item two</li>');
    expect(result).toContain('</ul>');
  });

  it('converts unordered list items with * to ul/li', () => {
    const result = convertMarkdownToHtmlBody('* item one');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>item one</li>');
  });

  it('converts ordered list items to ol/li', () => {
    const result = convertMarkdownToHtmlBody('1. first\n2. second');
    expect(result).toContain('<ol>');
    expect(result).toContain('<li>first</li>');
    expect(result).toContain('<li>second</li>');
    expect(result).toContain('</ol>');
  });

  it('converts blockquote lines to blockquote/p', () => {
    const result = convertMarkdownToHtmlBody('> quoted text');
    expect(result).toContain('<blockquote>');
    expect(result).toContain('<p>quoted text</p>');
    expect(result).toContain('</blockquote>');
  });

  it('converts --- to a horizontal rule', () => {
    const result = convertMarkdownToHtmlBody('---');
    expect(result).toContain('<hr>');
  });

  it('converts *** to a horizontal rule', () => {
    const result = convertMarkdownToHtmlBody('***');
    expect(result).toContain('<hr>');
  });

  it('wraps fenced code block content in pre/code and escapes HTML inside', () => {
    const result = convertMarkdownToHtmlBody(
      '```\n<script>evil()</script>\n```',
    );
    expect(result).toContain('<pre><code>');
    expect(result).toContain('&lt;script&gt;evil()&lt;/script&gt;');
    expect(result).toContain('</code></pre>');
  });

  it('closes unclosed code block at end of input', () => {
    const result = convertMarkdownToHtmlBody('```\nunclosed');
    expect(result).toContain('</code></pre>');
  });

  it('applies inline formatting inside list items', () => {
    const result = convertMarkdownToHtmlBody('- **bold item**');
    expect(result).toContain('<li><strong>bold item</strong></li>');
  });

  it('applies inline formatting inside headings', () => {
    const result = convertMarkdownToHtmlBody('## *Italic* heading');
    expect(result).toContain('<h2><em>Italic</em> heading</h2>');
  });

  it('closes list before a heading', () => {
    const result = convertMarkdownToHtmlBody('- item\n## Heading');
    expect(result).toContain('</ul>');
    expect(result).toContain('<h2>Heading</h2>');
  });
});

// ── buildNoteHtml ─────────────────────────────────────────────────────────────

describe('buildNoteHtml', () => {
  it('returns a string starting with <!DOCTYPE html>', () => {
    const result = buildNoteHtml('content', 'My Note');
    expect(result.trimStart()).toMatch(/^<!DOCTYPE html>/i);
  });

  it('includes the note title in the <title> tag', () => {
    const result = buildNoteHtml('content', 'My Note');
    expect(result).toContain('<title>My Note</title>');
  });

  it('renders the note title as an h1 in the body', () => {
    const result = buildNoteHtml('content', 'My Note');
    expect(result).toContain('<h1>My Note</h1>');
  });

  it('escapes HTML entities in the note title', () => {
    const result = buildNoteHtml('content', 'Notes & <Ideas>');
    expect(result).toContain('Notes &amp; &lt;Ideas&gt;');
  });

  it('includes the converted markdown body in the document', () => {
    const result = buildNoteHtml('## Section', 'Title');
    expect(result).toContain('<h2>Section</h2>');
  });

  it('includes a <style> block with the export styles', () => {
    const result = buildNoteHtml('content', 'Title');
    expect(result).toContain('<style>');
    expect(result).toContain('font-family');
  });

  it('sets lang="en" on the html element', () => {
    const result = buildNoteHtml('content', 'Title');
    expect(result).toContain('lang="en"');
  });
});

// ── buildMailtoUrl ────────────────────────────────────────────────────────────

describe('stripMarkdownToPlainText', () => {
  it('removes heading markers but keeps the heading text', () => {
    expect(stripMarkdownToPlainText('# Hello')).toBe('Hello');
    expect(stripMarkdownToPlainText('## Hello')).toBe('Hello');
    expect(stripMarkdownToPlainText('###### Hello')).toBe('Hello');
  });

  it('removes ** bold markers but keeps the text', () => {
    expect(stripMarkdownToPlainText('**bold**')).toBe('bold');
  });

  it('removes __ bold markers but keeps the text', () => {
    expect(stripMarkdownToPlainText('__bold__')).toBe('bold');
  });

  it('removes * italic markers but keeps the text', () => {
    expect(stripMarkdownToPlainText('*italic*')).toBe('italic');
  });

  it('removes _ italic markers but keeps the text', () => {
    expect(stripMarkdownToPlainText('_italic_')).toBe('italic');
  });

  it('removes ~~ strikethrough markers but keeps the text', () => {
    expect(stripMarkdownToPlainText('~~struck~~')).toBe('struck');
  });

  it('removes backtick inline code markers but keeps the text', () => {
    expect(stripMarkdownToPlainText('`code`')).toBe('code');
  });

  it('removes == highlight markers but keeps the text', () => {
    expect(stripMarkdownToPlainText('==highlight==')).toBe('highlight');
  });

  it('converts - unordered list markers to a bullet character', () => {
    expect(stripMarkdownToPlainText('- item')).toContain('\u2022 item');
  });

  it('converts * unordered list markers to a bullet character', () => {
    expect(stripMarkdownToPlainText('* item')).toContain('\u2022 item');
  });

  it('removes ordered list numbering but keeps the text', () => {
    expect(stripMarkdownToPlainText('1. first')).toContain('first');
    expect(stripMarkdownToPlainText('1. first')).not.toContain('1.');
  });

  it('removes blockquote markers but keeps the quoted text', () => {
    expect(stripMarkdownToPlainText('> quoted')).toContain('quoted');
    expect(stripMarkdownToPlainText('> quoted')).not.toContain('>');
  });

  it('removes fenced code block delimiters but keeps code content', () => {
    const result = stripMarkdownToPlainText('```\nconst x = 1;\n```');
    expect(result).toContain('const x = 1;');
    expect(result).not.toMatch(/^```/m);
  });

  it('removes horizontal rule markers', () => {
    expect(stripMarkdownToPlainText('---')).toBe('');
    expect(stripMarkdownToPlainText('***')).toBe('');
  });

  it('converts markdown links to their visible text only', () => {
    expect(stripMarkdownToPlainText('[click here](https://example.com)')).toBe(
      'click here',
    );
  });

  it('trims leading and trailing whitespace from the result', () => {
    expect(stripMarkdownToPlainText('  hello  ')).toBe('hello');
  });

  it('returns an empty string when given an empty string', () => {
    expect(stripMarkdownToPlainText('')).toBe('');
  });

  it('returns content unchanged when there is no markdown', () => {
    expect(stripMarkdownToPlainText('plain text here')).toBe('plain text here');
  });
});

// ── exportNoteAsPdfAndEmail ───────────────────────────────────────────────────

describe('buildEmlContent', () => {
  it('starts with the MIME-Version header', () => {
    const result = buildEmlContent('html', 'text', 'Subject');
    expect(result).toMatch(/^MIME-Version: 1\.0/);
  });

  it('includes the subject header', () => {
    const result = buildEmlContent('html', 'text', 'My Note Title');
    expect(result).toContain('Subject: My Note Title');
  });

  it('declares multipart/alternative content type', () => {
    const result = buildEmlContent('html', 'text', 'Subject');
    expect(result).toContain('Content-Type: multipart/alternative');
  });

  it('contains the EML boundary marker', () => {
    const result = buildEmlContent('html', 'text', 'Subject');
    expect(result).toContain('--onenote-ribbon-v1');
  });

  it('includes a text/plain part', () => {
    const result = buildEmlContent('html', 'text', 'Subject');
    expect(result).toContain('Content-Type: text/plain');
  });

  it('includes a text/html part', () => {
    const result = buildEmlContent('html', 'text', 'Subject');
    expect(result).toContain('Content-Type: text/html');
  });

  it('marks both parts as base64 encoded', () => {
    const result = buildEmlContent('html', 'text', 'Subject');
    const base64OccurrenceCount = (
      result.match(/Content-Transfer-Encoding: base64/g) ?? []
    ).length;
    expect(base64OccurrenceCount).toBe(2);
  });

  it('base64-encodes the HTML content into the EML body', () => {
    // Short content stays within the 76-char base64 line limit
    const result = buildEmlContent('hi', 'ok', 'Subject');
    const expectedHtmlBase64 = Buffer.from('hi', 'utf-8').toString('base64');
    expect(result).toContain(expectedHtmlBase64);
  });

  it('base64-encodes the plain text content into the EML body', () => {
    const result = buildEmlContent('hi', 'ok', 'Subject');
    const expectedTextBase64 = Buffer.from('ok', 'utf-8').toString('base64');
    expect(result).toContain(expectedTextBase64);
  });

  it('ends with the closing boundary marker', () => {
    const result = buildEmlContent('html', 'text', 'Subject');
    expect(result.trimEnd()).toMatch(/--onenote-ribbon-v1--$/);
  });
});

// ── buildEmlWithPdfAttachment ─────────────────────────────────────────────────

describe('buildEmlWithPdfAttachment', () => {
  const fakePdf = Buffer.from('%PDF-1.4 fake');

  it('starts with the MIME-Version header', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'Title');
    expect(result).toMatch(/^MIME-Version: 1\.0/);
  });

  it('includes the subject header', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'My Note Title', 'Title');
    expect(result).toContain('Subject: My Note Title');
  });

  it('declares multipart/mixed content type', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'Title');
    expect(result).toContain('Content-Type: multipart/mixed');
  });

  it('contains the EML boundary marker', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'Title');
    expect(result).toContain('--onenote-ribbon-v1');
  });

  it('includes a text/plain part with generic body text', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'Title');
    expect(result).toContain('Content-Type: text/plain; charset="UTF-8"');
    // EML wraps base64 at 76 chars per RFC 2045 — check for the first 76-char line of the encoded body.
    const fullBase64 = Buffer.from(
      'Your note is attached and ready to share.\n\nHope this makes your day a little brighter.',
      'utf-8',
    ).toString('base64');
    expect(result).toContain(fullBase64.slice(0, 76));
  });

  it('includes an application/pdf attachment part', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'Title');
    expect(result).toContain('Content-Type: application/pdf');
    expect(result).toContain('Content-Disposition: attachment');
  });

  it('derives the attachment filename from the note title', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'My Note');
    expect(result).toContain('filename="My Note.pdf"');
  });

  it('strips unsafe characters from the attachment filename', () => {
    const result = buildEmlWithPdfAttachment(
      fakePdf,
      'Subject',
      'Note: <Draft>',
    );
    // Colon, space, angle brackets are stripped — only word chars, spaces, hyphens remain
    expect(result).toContain('filename="Note Draft.pdf"');
  });

  it('base64-encodes the PDF buffer into the attachment part', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'Title');
    const expectedPdfBase64 = fakePdf.toString('base64');
    expect(result).toContain(expectedPdfBase64);
  });

  it('ends with the closing boundary marker', () => {
    const result = buildEmlWithPdfAttachment(fakePdf, 'Subject', 'Title');
    expect(result.trimEnd()).toMatch(/--onenote-ribbon-v1--$/);
  });
});

describe('sendNoteByEmail', () => {
  const fakePdfBuffer = Buffer.from('%PDF-1.4 mock');

  const buildMockDependencies = (): {
    mockDependencies: SendNoteByEmailDependencies;
    buildHtml: jest.Mock;
    writeEmlToTemp: jest.Mock;
    openEmlFile: jest.Mock;
    displayNotice: jest.Mock;
    generatePdf: jest.Mock;
    deleteFile: jest.Mock;
  } => {
    const buildHtml = jest
      .fn()
      .mockResolvedValue(
        '<!DOCTYPE html><html><body>rendered note</body></html>',
      );
    const writeEmlToTemp = jest.fn().mockReturnValue('/tmp/My Note.eml');
    const openEmlFile = jest.fn().mockResolvedValue(undefined);
    const displayNotice = jest.fn();
    const generatePdf = jest.fn().mockResolvedValue(fakePdfBuffer);
    const deleteFile = jest.fn();

    return {
      mockDependencies: {
        buildHtml,
        writeEmlToTemp,
        openEmlFile,
        displayNotice,
        generatePdf,
        deleteFile,
      },
      buildHtml,
      writeEmlToTemp,
      openEmlFile,
      displayNotice,
      generatePdf,
      deleteFile,
    };
  };

  it('calls buildHtml with the note markdown and title', async () => {
    const { mockDependencies, buildHtml } = buildMockDependencies();
    await sendNoteByEmail('# My Note\nHello', 'My Note', mockDependencies);
    expect(buildHtml).toHaveBeenCalledWith('# My Note\nHello', 'My Note');
  });

  it('calls generatePdf with the HTML returned by buildHtml', async () => {
    const { mockDependencies, generatePdf } = buildMockDependencies();
    await sendNoteByEmail('# My Note\nHello', 'My Note', mockDependencies);
    expect(generatePdf).toHaveBeenCalledWith(
      expect.stringContaining('<!DOCTYPE html>'),
    );
  });

  it('calls writeEmlToTemp with EML containing a PDF attachment and the note title', async () => {
    const { mockDependencies, writeEmlToTemp } = buildMockDependencies();
    await sendNoteByEmail('# My Note\nHello', 'My Note', mockDependencies);
    expect(writeEmlToTemp).toHaveBeenCalledWith(
      expect.stringContaining('MIME-Version'),
      'My Note',
    );
  });

  it('EML passed to writeEmlToTemp includes the note subject', async () => {
    const { mockDependencies, writeEmlToTemp } = buildMockDependencies();
    await sendNoteByEmail('content', 'My Note', mockDependencies);
    const emlContent: string = writeEmlToTemp.mock.calls[0][0];
    expect(emlContent).toContain('Subject: Note: My Note');
  });

  it('EML passed to writeEmlToTemp declares multipart/mixed with a PDF attachment', async () => {
    const { mockDependencies, writeEmlToTemp } = buildMockDependencies();
    await sendNoteByEmail('content', 'My Note', mockDependencies);
    const emlContent: string = writeEmlToTemp.mock.calls[0][0];
    expect(emlContent).toContain('multipart/mixed');
    expect(emlContent).toContain('Content-Type: application/pdf');
  });

  it('calls openEmlFile with the path returned by writeEmlToTemp', async () => {
    const { mockDependencies, openEmlFile } = buildMockDependencies();
    await sendNoteByEmail('content', 'My Note', mockDependencies);
    expect(openEmlFile).toHaveBeenCalledWith('/tmp/My Note.eml');
  });

  it('calls displayNotice after opening the EML file', async () => {
    const { mockDependencies, displayNotice } = buildMockDependencies();
    await sendNoteByEmail('content', 'My Note', mockDependencies);
    expect(displayNotice).toHaveBeenCalled();
  });

  it('schedules deleteFile with the EML path after the delay', async () => {
    jest.useFakeTimers();
    const { mockDependencies, deleteFile } = buildMockDependencies();

    await sendNoteByEmail('content', 'My Note', mockDependencies);

    expect(deleteFile).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(deleteFile).toHaveBeenCalledWith('/tmp/My Note.eml');

    jest.useRealTimers();
  });

  it('propagates errors thrown by openEmlFile', async () => {
    const { mockDependencies, openEmlFile } = buildMockDependencies();
    openEmlFile.mockRejectedValue(new Error('Cannot open file'));
    await expect(
      sendNoteByEmail('content', 'My Note', mockDependencies),
    ).rejects.toThrow('Cannot open file');
  });

  it('propagates errors thrown by generatePdf', async () => {
    const { mockDependencies, generatePdf } = buildMockDependencies();
    generatePdf.mockRejectedValue(new Error('PDF failed'));
    await expect(
      sendNoteByEmail('content', 'My Note', mockDependencies),
    ).rejects.toThrow('PDF failed');
  });
});
