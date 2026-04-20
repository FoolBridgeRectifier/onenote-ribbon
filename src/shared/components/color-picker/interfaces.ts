/** Props for the ColorPicker dropdown component. */
export interface ColorPickerProps {
  anchor: HTMLElement | null;
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  onNoColor: () => void;
  onClose: () => void;
  label?: string;
}
