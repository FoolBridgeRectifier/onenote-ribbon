import { toggleInline } from "../../../../shared/toggleInline";
import { toggleLinePrefix } from "../../../../shared/toggleLinePrefix";
import { tagNotation } from "../tags-data";

/** Toggle tag notation on/off for the current line. */
export function applyTag(cmd: string, editor: any): void {
  const notation = tagNotation(cmd);
  if (!notation) return;

  if (cmd === "tag-highlight") {
    toggleInline(editor, "==");
    return;
  }

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const firstPart = notation.split("\n")[0];

  if (line.startsWith(firstPart)) {
    // Toggle OFF
    const notationLines = notation.split("\n");
    if (notationLines.length > 1) {
      // Multiline callout — delete header line and strip continuation prefix from next line
      editor.replaceRange(
        "",
        { line: cursor.line, ch: 0 },
        { line: cursor.line + 1, ch: 0 },
      );
      const contPrefix = notationLines[1]; // e.g. "> "
      if (contPrefix) {
        const newLine = editor.getLine(cursor.line);
        if (newLine !== undefined && newLine.startsWith(contPrefix)) {
          editor.setLine(cursor.line, newLine.slice(contPrefix.length));
        }
      }
    } else {
      editor.setLine(cursor.line, line.slice(firstPart.length));
    }
  } else if (
    cmd === "tag-todo" ||
    cmd === "tag-todo-p1" ||
    cmd === "tag-todo-p2"
  ) {
    toggleLinePrefix(editor, firstPart);
  } else {
    editor.replaceRange(notation, cursor);
  }
}
