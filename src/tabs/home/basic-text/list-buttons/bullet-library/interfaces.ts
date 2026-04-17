/** Props accepted by the BulletLibrary component. */
export interface BulletLibraryProps {
  /** The DOM element that triggered the dropdown (used for positioning). */
  anchor: HTMLElement | null;
  /** The currently active preset id. */
  activePresetId: string;
  /** Called when the user selects a preset. */
  onSelectPreset: (presetId: string) => void;
  /** Called when the dropdown should close (click-outside or selection). */
  onClose: () => void;
}
