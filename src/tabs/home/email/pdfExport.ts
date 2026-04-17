// PDF generation using Electron's BrowserWindow + printToPDF API.
// The BrowserWindow is created hidden, loaded with the HTML content written to
// a temp file, and destroyed immediately after the PDF buffer is captured.

/**
 * Minimal interface for the Electron BrowserWindow subset used here.
 * Avoids importing @electron/remote types, which are not in devDependencies.
 */
interface ElectronBrowserWindow {
  webContents: {
    once(event: string, callback: () => void): void;
    printToPDF(options: { printBackground: boolean }): Promise<Buffer>;
  };
  loadFile(path: string): Promise<void>;
  destroy(): void;
}

/**
 * Generates a PDF buffer from an HTML string using Electron's printToPDF API.
 *
 * Writes the HTML to a temp file, creates a hidden BrowserWindow via
 * @electron/remote (available in Obsidian Desktop), waits for the page to
 * finish loading, prints to PDF, destroys the window, and cleans up the
 * temp HTML file. Rejects if printToPDF fails.
 */
export async function generatePdfFromHtml(
  htmlContent: string,
): Promise<Buffer> {
  // Use runtime requires (not top-level) so esbuild can bundle this
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const os = require('os');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BrowserWindow } = require('@electron/remote');

  // Use a unique temp file so concurrent calls don't collide
  const tempHtmlPath = path.join(
    os.tmpdir(),
    `onenote-ribbon-print-${Date.now()}.html`,
  );

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const browserWindow = new BrowserWindow({ show: false });

  return new Promise<Buffer>((resolve, reject) => {
    browserWindow.webContents.once('did-finish-load', () => {
      browserWindow.webContents
        .printToPDF({ printBackground: true })
        .then((pdfBuffer: Buffer) => {
          browserWindow.destroy();

          // Clean up the temp HTML file — ignore errors if it's already gone
          try {
            fs.unlinkSync(tempHtmlPath);
          } catch {
            // Intentionally empty — cleanup failure is non-fatal
          }

          resolve(pdfBuffer);
        })
        .catch((error: Error) => {
          browserWindow.destroy();

          try {
            fs.unlinkSync(tempHtmlPath);
          } catch {
            // Intentionally empty
          }

          reject(error);
        });
    });

    browserWindow.loadFile(tempHtmlPath);
  });
}
