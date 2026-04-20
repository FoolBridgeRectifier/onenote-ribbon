import { EML_BOUNDARY, EMAIL_BODY_TEXT } from '../../constants';

/**
 * Wraps a base64 string at 76 characters per line as required by the MIME spec
 * (RFC 2045 §6.8).
 */
function wrapBase64AtLineLength(base64String: string): string {
  return (base64String.match(/.{1,76}/g) ?? [base64String]).join('\r\n');
}

/**
 * Builds a MIME multipart/alternative EML string with a text/plain fallback
 * and a text/html primary part. Both parts are base64-encoded (UTF-8).
 *
 * The resulting string can be written to a `.eml` file and opened directly
 * by any standard email client (Outlook, Thunderbird, Windows Mail, etc.),
 * which will display the formatted HTML body pre-filled and ready to send.
 */
export function buildEmlContent(
  htmlContent: string,
  plainTextContent: string,
  subject: string
): string {
  const encodedHtml = wrapBase64AtLineLength(Buffer.from(htmlContent, 'utf-8').toString('base64'));
  const encodedPlainText = wrapBase64AtLineLength(
    Buffer.from(plainTextContent, 'utf-8').toString('base64')
  );

  return [
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${EML_BOUNDARY}"`,
    '',
    `--${EML_BOUNDARY}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedPlainText,
    '',
    `--${EML_BOUNDARY}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedHtml,
    '',
    `--${EML_BOUNDARY}--`,
  ].join('\r\n');
}

/**
 * Builds a MIME multipart/mixed EML string with a generic plain-text body and a PDF
 * file attachment. The PDF is base64-encoded per RFC 2045 §6.8.
 *
 * The plain-text part gives email clients a readable fallback message while
 * the attached PDF carries the fully styled note content.
 */
export function buildEmlWithPdfAttachment(
  pdfBuffer: Buffer,
  subject: string,
  noteTitle: string
): string {
  // Derive a safe file name by stripping characters that are unsafe in paths
  const safeFileName = noteTitle.replace(/[^\w\s-]/g, '').trim() + '.pdf';

  const encodedBody = wrapBase64AtLineLength(
    Buffer.from(EMAIL_BODY_TEXT, 'utf-8').toString('base64')
  );
  const encodedPdf = wrapBase64AtLineLength(pdfBuffer.toString('base64'));

  return [
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    `Content-Type: multipart/mixed; boundary="${EML_BOUNDARY}"`,
    '',
    `--${EML_BOUNDARY}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedBody,
    '',
    `--${EML_BOUNDARY}`,
    `Content-Type: application/pdf; name="${safeFileName}"`,
    `Content-Disposition: attachment; filename="${safeFileName}"`,
    'Content-Transfer-Encoding: base64',
    '',
    encodedPdf,
    '',
    `--${EML_BOUNDARY}--`,
  ].join('\r\n');
}
