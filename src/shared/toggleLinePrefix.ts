export function toggleLinePrefix(editor: any, prefix: string): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  // For todo-style prefixes, also treat completed variants (- [x] / - [X] / - [✔] ) as "has prefix"
  let hasPrefix = line.startsWith(prefix);
  let actualPrefixLength = prefix.length;

  // For "- " bullet prefix: if line has a full checklist variant, strip the full prefix (not just "- ")
  if (hasPrefix && prefix === "- ") {
    for (const v of ["- [ ] ", "- [x] ", "- [X] ", "- [✔] "]) {
      if (line.startsWith(v)) {
        actualPrefixLength = v.length;
        break;
      }
    }
  }

  if (!hasPrefix && prefix.startsWith("- [ ] ")) {
    const rest = prefix.slice("- [ ] ".length); // e.g. "" or "🔴 " or "🟡 "
    for (const v of ["- [x] ", "- [X] ", "- [✔] "]) {
      if (line.startsWith(v + rest)) {
        hasPrefix = true;
        actualPrefixLength = (v + rest).length;
        break;
      }
    }
  }

  if (hasPrefix) {
    editor.setLine(cursor.line, line.slice(actualPrefixLength));
  } else {
    const stripped = line.replace(
      /^(#{1,6} |- \[[ x✔]\] (?:🔴 |🟡 )?|- |\d+\. |> \[![^\]]+\]\n> )/,
      "",
    );
    editor.setLine(cursor.line, prefix + stripped);
  }
}
