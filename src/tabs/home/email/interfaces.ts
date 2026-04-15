/**
 * Injectable dependencies for EML-based email sending.
 * Using an interface here lets tests inject mocks while production code
 * uses the real Electron/Node implementations.
 */
export interface SendNoteByEmailDependencies {
  /** Writes the EML string to a temp file and returns the saved absolute path. */
  writeEmlToTemp: (emlContent: string, noteTitle: string) => string;

  /** Opens the saved EML file using the system's default email client. */
  openEmlFile: (filePath: string) => Promise<void>;

  /** Shows an Obsidian Notice with the given message. */
  displayNotice: (message: string) => void;
}
