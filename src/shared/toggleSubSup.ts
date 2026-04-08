export function toggleSubSup(editor: any, tag: "sub" | "sup"): void {
  const open = `<${tag}>`; // length 5
  const close = `</${tag}>`; // length 6
  const otherTag = tag === "sub" ? "sup" : "sub";
  const otherOpen = `<${otherTag}>`;
  const otherClose = `</${otherTag}>`;

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const ch = cursor.ch;

  // Returns the span {start, openEnd, closeStart, end} if ch falls inside it.
  // Active region matches updateRibbonState: ch > openLastCharIdx AND ch < closeEnd
  const findSpan = (ot: string, ct: string) => {
    const oLen = ot.length;
    const cLen = ct.length;
    let p = 0;
    while (p < line.length) {
      const o = line.indexOf(ot, p);
      if (o < 0) break;
      const c2 = line.indexOf(ct, o + oLen);
      if (c2 < 0) break;
      if (ch > o + oLen - 1 && ch < c2 + cLen) {
        return { start: o, openEnd: o + oLen, closeStart: c2, end: c2 + cLen };
      }
      p = c2 + cLen;
    }
    return null;
  };

  const thisSpan = findSpan(open, close);
  const otherSpan = findSpan(otherOpen, otherClose);

  if (thisSpan) {
    // Toggle off — strip tags, keep inner content
    const inner = line.slice(thisSpan.openEnd, thisSpan.closeStart);
    editor.setLine(
      cursor.line,
      line.slice(0, thisSpan.start) + inner + line.slice(thisSpan.end),
    );
  } else if (otherSpan) {
    // Mutually exclusive — convert the other tag to this one
    const inner = line.slice(otherSpan.openEnd, otherSpan.closeStart);
    editor.setLine(
      cursor.line,
      line.slice(0, otherSpan.start) +
        open +
        inner +
        close +
        line.slice(otherSpan.end),
    );
  } else {
    // Toggle on — wrap selection or insert empty pair
    const sel = editor.getSelection();
    if (sel) {
      editor.replaceSelection(`${open}${sel}${close}`);
    } else {
      editor.replaceRange(`${open}${close}`, cursor);
      editor.setCursor({ line: cursor.line, ch: cursor.ch + open.length });
    }
  }
}
