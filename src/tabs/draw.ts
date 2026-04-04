import { TabDefinition } from "../types";

export const DRAW_TAB: TabDefinition = {
  id: "draw",
  label: "Draw",
  groups: [
    {
      id: "undoDraw", label: "Undo",
      items: [
        { id: "undoD", label: "Undo", icon: "undo", iconColor: "#374151", size: "lg", nativeClipboard: "undo" },
        { id: "redoD", label: "Redo", icon: "redo", iconColor: "#374151", size: "lg", nativeClipboard: "redo" },
      ],
    },
    {
      id: "selection", label: "Selection",
      items: [
        { id: "selectTool", label: "Select",       icon: "cursor", iconColor: "#374151", size: "lg", canvasOnly: true },
        { id: "lassoTool",  label: "Lasso Select", icon: "lasso",  iconColor: "#7218A5", size: "lg", canvasOnly: true },
      ],
    },
    {
      id: "drawTools", label: "Drawing Tools",
      items: [
        { id: "penTool",    label: "Draw",   icon: "pen",    iconColor: "#ec4899", size: "lg", commandId: "canvas:convert-to-file", canvasOnly: true },
        { id: "shapesTool", label: "Shapes", icon: "shapes", iconColor: "#ea580c", size: "lg", canvasOnly: true },
        { id: "panTool",    label: "Pan",    icon: "hand",   iconColor: "#374151", size: "lg", canvasOnly: true },
      ],
    },
    {
      id: "canvasFiles", label: "Canvas",
      items: [
        { id: "newCanvas",    label: "New Canvas",    icon: "canvas",   iconColor: "#059669", size: "lg", commandId: "canvas:new-file" },
        { id: "fullPageView", label: "Full Page View", icon: "maximize", iconColor: "#2563eb", size: "lg", canvasOnly: true },
      ],
    },
  ],
};
