/**
 * Injectable dependencies for EML-based email sending.
 * Using an interface here lets tests inject mocks while production code
 * uses the real Electron/Node implementations.
 */
export interface SendNoteByEmailDependencies {
  /**
   * Renders markdown + note title to a complete, self-contained HTML string
   * with all styles inlined. Used as input to generatePdf.
   */
  buildHtml: (markdown: string, noteTitle: string) => Promise<string>;

  /** Writes the EML string to a temp file and returns the saved absolute path. */
  writeEmlToTemp: (emlContent: string, noteTitle: string) => string;

  /** Opens the saved EML file using the system's default email client. */
  openEmlFile: (filePath: string) => Promise<void>;

  /** Shows an Obsidian Notice with the given message. */
  displayNotice: (message: string) => void;

  /**
   * Generates a PDF buffer from an HTML string using Electron's printToPDF API.
   * The HTML is rendered in a hidden BrowserWindow and captured as a PDF.
   */
  generatePdf: (htmlContent: string) => Promise<Buffer>;

  /**
   * Deletes a file from the file system.
   * Called after the EML has been opened to clean up the temp file.
   */
  deleteFile: (filePath: string) => void;
}
