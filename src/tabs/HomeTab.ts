import { App, Notice } from "obsidian";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DropdownItem {
  label: string;
  sublabel?: string;
  style?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface DropdownOpts {
  bg?: string;
  hoverBg?: string;
  color?: string;
}

interface TagDef {
  label: string;
  icon: string;
  iconStyle: string;
  cmd: string;
}

// ─── Full OneNote tag list ────────────────────────────────────────────────────

const ALL_TAGS: TagDef[] = [
  {
    label: "To Do",
    cmd: "tag-todo",
    icon: "✔",
    iconStyle: "background:#4472C4;color:#fff",
  },
  {
    label: "Important",
    cmd: "tag-important",
    icon: "★",
    iconStyle: "background:#F5A623;color:#fff",
  },
  {
    label: "Question",
    cmd: "tag-question",
    icon: "?",
    iconStyle: "background:#7030A0;color:#fff",
  },
  {
    label: "Remember for later",
    cmd: "tag-remember",
    icon: "🔔",
    iconStyle: "background:#ED7D31;color:#fff",
  },
  {
    label: "Definition",
    cmd: "tag-definition",
    icon: "📖",
    iconStyle: "background:#70AD47;color:#fff",
  },
  {
    label: "Highlight",
    cmd: "tag-highlight",
    icon: "✏",
    iconStyle: "background:#FFFF00;color:#333;border:1px solid #ccc",
  },
  {
    label: "Contact",
    cmd: "tag-contact",
    icon: "👤",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Address",
    cmd: "tag-address",
    icon: "🏠",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Phone number",
    cmd: "tag-phone",
    icon: "📞",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Web site to visit",
    cmd: "tag-website",
    icon: "🌐",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Idea",
    cmd: "tag-idea",
    icon: "💡",
    iconStyle: "background:#FFD700;color:#333",
  },
  {
    label: "Password",
    cmd: "tag-password",
    icon: "🔑",
    iconStyle: "background:#808080;color:#fff",
  },
  {
    label: "Critical",
    cmd: "tag-critical",
    icon: "!",
    iconStyle: "background:#FF0000;color:#fff",
  },
  {
    label: "Project A",
    cmd: "tag-project-a",
    icon: " ",
    iconStyle: "background:#FF6B6B",
  },
  {
    label: "Project B",
    cmd: "tag-project-b",
    icon: " ",
    iconStyle: "background:#FFD700",
  },
  {
    label: "Movie to see",
    cmd: "tag-movie",
    icon: "🎬",
    iconStyle: "background:#333;color:#fff",
  },
  {
    label: "Book to read",
    cmd: "tag-book",
    icon: "📚",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Music to listen to",
    cmd: "tag-music",
    icon: "♪",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Source for article",
    cmd: "tag-source",
    icon: "🔍",
    iconStyle: "background:#808080;color:#fff",
  },
  {
    label: "Remember for blog",
    cmd: "tag-blog",
    icon: "📝",
    iconStyle: "background:#333;color:#fff",
  },
  {
    label: "Discuss with A",
    cmd: "tag-discuss-a",
    icon: "💬",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Discuss with B",
    cmd: "tag-discuss-b",
    icon: "💬",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Discuss w/ manager",
    cmd: "tag-discuss-mgr",
    icon: "💬",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Send in email",
    cmd: "tag-email",
    icon: "✉",
    iconStyle: "background:#5B9BD5;color:#fff",
  },
  {
    label: "Schedule meeting",
    cmd: "tag-meeting",
    icon: "📅",
    iconStyle: "background:#4472C4;color:#fff",
  },
  {
    label: "Call back",
    cmd: "tag-call",
    icon: "📞",
    iconStyle: "background:#70AD47;color:#fff",
  },
  {
    label: "To Do priority 1",
    cmd: "tag-todo-p1",
    icon: "✔",
    iconStyle: "background:#4472C4;color:#fff",
  },
  {
    label: "To Do priority 2",
    cmd: "tag-todo-p2",
    icon: "✔",
    iconStyle: "background:#4472C4;color:#fff",
  },
];

const TAG_CMD_TO_DEF: Record<string, TagDef> = {};
for (const t of ALL_TAGS) TAG_CMD_TO_DEF[t.cmd] = t;

// ─── Styles list for the preview panel ───────────────────────────────────────

interface StyleDef {
  label: string;
  style: string;
  prefix: string;
  suffix?: string;
}

const STYLES_LIST: StyleDef[] = [
  { label: "Heading 1", style: "font-size:15px;font-weight:700;color:#5B9BD5;letter-spacing:-0.5px", prefix: "# " },
  { label: "Heading 2", style: "font-size:13px;font-weight:700;color:#5B9BD5", prefix: "## " },
  { label: "Heading 3", style: "font-size:12px;font-weight:700;color:#5B9BD5", prefix: "### " },
  { label: "Heading 4", style: "font-size:12px;font-weight:700;font-style:italic;color:#5B9BD5", prefix: "#### " },
  { label: "Heading 5", style: "font-size:11px;font-weight:700;color:#5B9BD5", prefix: "##### " },
  { label: "Heading 6", style: "font-size:11px;font-style:italic;color:#5B9BD5", prefix: "###### " },
  { label: "Page Title", style: "font-size:20px;font-weight:700;color:#fff", prefix: "# " },
  { label: "Citation", style: "font-size:11px;color:#888;font-style:italic", prefix: "> " },
  { label: "Quote", style: "font-size:12px;font-style:italic;color:#ccc", prefix: "> " },
  { label: "Code", style: "font-family:monospace;font-size:11px;background:#222;padding:0 4px;color:#e0e0e0", prefix: "```\n", suffix: "\n```" },
  { label: "Normal", style: "font-size:12px;color:#e0e0e0", prefix: "" },
];

// Map tag cmd → Markdown notation to insert/toggle
function tagNotation(cmd: string): string {
  const map: Record<string, string> = {
    "tag-todo": "- [ ] ",
    "tag-todo-p1": "- [ ] 🔴 ",
    "tag-todo-p2": "- [ ] 🟡 ",
    "tag-important": "> [!important]\n> ",
    "tag-question": "> [!question]\n> ",
    "tag-remember": "> [!note] Remember for later\n> ",
    "tag-definition": "> [!info] Definition\n> ",
    "tag-highlight": "==",
    "tag-contact": "> [!tip] Contact\n> ",
    "tag-address": "> [!abstract] Address\n> ",
    "tag-phone": "> [!example] Phone\n> ",
    "tag-website": "> [!todo] Website\n> ",
    "tag-idea": "> [!tip] 💡 Idea\n> ",
    "tag-password": "> [!warning] Password\n> ",
    "tag-critical": "> [!danger] Critical\n> ",
    "tag-project-a": "> [!failure] Project A\n> ",
    "tag-project-b": "> [!bug] Project B\n> ",
    "tag-movie": "> [!note] 🎬 Movie to see\n> ",
    "tag-book": "> [!note] 📚 Book to read\n> ",
    "tag-music": "> [!note] ♪ Music\n> ",
    "tag-source": "> [!note] Source\n> ",
    "tag-blog": "> [!note] Blog\n> ",
    "tag-discuss-a": "> [!tip] Discuss with A\n> ",
    "tag-discuss-b": "> [!tip] Discuss with B\n> ",
    "tag-discuss-mgr": "> [!tip] Discuss with manager\n> ",
    "tag-email": "> [!todo] Send in email\n> ",
    "tag-meeting": "> [!todo] Schedule meeting\n> ",
    "tag-call": "> [!todo] Call back\n> ",
  };
  return map[cmd] ?? "";
}

// ─── Overlay dropdown helper ──────────────────────────────────────────────────

function showDropdown(anchor: HTMLElement, items: DropdownItem[], opts?: DropdownOpts): void {
  // Remove any existing dropdown
  document
    .querySelectorAll(".onr-overlay-dropdown")
    .forEach((el) => el.remove());

  const menu = document.createElement("div");
  menu.className = "onr-overlay-dropdown";

  const menuBg = opts?.bg ?? "#fff";
  const hoverBg = opts?.hoverBg ?? "#f0eeec";
  const textColor = opts?.color ?? "#201f1e";

  // Determine scrolling — large menus get max-height + scroll
  const needsScroll = items.length > 15;
  Object.assign(menu.style, {
    position: "fixed",
    background: menuBg,
    border: "1px solid #c8c6c4",
    borderRadius: "2px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    zIndex: "99999",
    minWidth: "160px",
    padding: "2px 0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    fontSize: "12px",
    ...(needsScroll ? { maxHeight: "340px", overflowY: "auto" } : {}),
  });

  for (const item of items) {
    if (item.divider) {
      const div = document.createElement("div");
      Object.assign(div.style, {
        borderTop: "1px solid #e1dfdd",
        margin: "2px 0",
      });
      menu.appendChild(div);
      continue;
    }
    const row = document.createElement("div");
    row.className = "onr-dd-item";
    Object.assign(row.style, {
      padding: "5px 12px",
      cursor: item.disabled ? "default" : "pointer",
      color: item.disabled ? "#a19f9d" : textColor,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      whiteSpace: "nowrap",
    });
    if (item.style)
      row.setAttribute("style", row.getAttribute("style") + ";" + item.style);
    row.textContent = item.label;
    if (item.sublabel) {
      const sub = document.createElement("span");
      sub.textContent = item.sublabel;
      sub.style.cssText =
        "font-size:10px;color:#605e5c;margin-left:auto;padding-left:16px";
      row.appendChild(sub);
    }
    if (!item.disabled) {
      row.addEventListener("mouseenter", () => {
        row.style.background = hoverBg;
      });
      row.addEventListener("mouseleave", () => {
        row.style.background = "";
      });
      row.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.remove();
        item.action();
      });
    }
    menu.appendChild(row);
  }

  document.body.appendChild(menu);

  // Position below anchor
  const rect = anchor.getBoundingClientRect();
  let top = rect.bottom + 2;
  let left = rect.left;

  // Clamp within viewport
  const mh = needsScroll ? 340 : menu.scrollHeight || 200;
  if (top + mh > window.innerHeight) top = rect.top - mh - 2;
  if (left + 200 > window.innerWidth) left = window.innerWidth - 204;

  menu.style.top = top + "px";
  menu.style.left = left + "px";

  // Close on outside click
  const close = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("click", close, true);
    }
  };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}

// ─── Tags dropdown with full scrollable list ──────────────────────────────────

function showTagsDropdown(anchor: HTMLElement, app: App): void {
  const editor = app.workspace.activeEditor?.editor;

  document
    .querySelectorAll(".onr-overlay-dropdown")
    .forEach((el) => el.remove());
  const menu = document.createElement("div");
  menu.className = "onr-overlay-dropdown";
  Object.assign(menu.style, {
    position: "fixed",
    background: "#1a1a1a",
    border: "1px solid #555",
    borderRadius: "2px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    zIndex: "99999",
    minWidth: "220px",
    padding: "2px 0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    fontSize: "12px",
    maxHeight: "420px",
    overflowY: "auto",
  });

  for (const tag of ALL_TAGS) {
    const row = document.createElement("div");
    row.className = "onr-dd-item";
    Object.assign(row.style, {
      padding: "4px 8px",
      cursor: "pointer",
      color: "#e0e0e0",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    });

    const iconEl = document.createElement("span");
    iconEl.textContent = tag.icon;
    iconEl.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:2px;font-size:10px;flex-shrink:0;${tag.iconStyle}`;

    const labelEl = document.createElement("span");
    labelEl.textContent = tag.label;
    labelEl.style.cssText = "flex:1;font-size:11px";

    // Checkbox swatch (visual state)
    const check = document.createElement("div");
    check.style.cssText =
      "width:16px;height:16px;border:1px solid #666;background:#333;flex-shrink:0;border-radius:1px;display:flex;align-items:center;justify-content:center";

    // Check if current line has this tag active
    if (editor) {
      const lineText = editor.getLine(editor.getCursor().line);
      const notation = tagNotation(tag.cmd);
      if (notation && lineText.includes(notation.split("\n")[0].trim())) {
        check.style.background = "#4472C4";
        check.innerHTML =
          '<svg viewBox="0 0 12 12" style="width:10px;height:10px"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none"/></svg>';
      }
    }

    row.appendChild(iconEl);
    row.appendChild(labelEl);
    row.appendChild(check);

    row.addEventListener("mouseenter", () => {
      row.style.background = "#2a2a3e";
    });
    row.addEventListener("mouseleave", () => {
      row.style.background = "";
    });
    row.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.remove();
      if (editor) applyTag(tag.cmd, editor);
    });

    menu.appendChild(row);
  }

  // Divider + Customize Tags
  const div = document.createElement("div");
  div.style.cssText = "border-top:1px solid #555;margin:2px 0";
  menu.appendChild(div);

  const customRow = document.createElement("div");
  customRow.style.cssText =
    "padding:5px 8px;cursor:pointer;color:#888;font-size:11px;display:flex;align-items:center;gap:6px";
  customRow.innerHTML =
    '<span style="font-size:13px">🔧</span> Customize Tags...';
  customRow.addEventListener("click", () => {
    menu.remove();
    new Notice("Customize Tags is not yet implemented");
  });
  menu.appendChild(customRow);

  document.body.appendChild(menu);

  const rect = anchor.getBoundingClientRect();
  let top = rect.bottom + 2;
  let left = rect.left;
  if (top + 420 > window.innerHeight)
    top = Math.max(4, window.innerHeight - 424);
  if (left + 224 > window.innerWidth) left = window.innerWidth - 228;
  menu.style.top = top + "px";
  menu.style.left = left + "px";

  const close = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("click", close, true);
    }
  };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}

// ─── Tag apply (toggle) logic ─────────────────────────────────────────────────

function applyTag(cmd: string, editor: any): void {
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

// ─── Inline toggle ────────────────────────────────────────────────────────────

function toggleInline(editor: any, open: string, close?: string): void {
  const cl = close ?? open;
  const sel = editor.getSelection();
  if (sel) {
    if (sel.startsWith(open) && sel.endsWith(cl)) {
      editor.replaceSelection(sel.slice(open.length, sel.length - cl.length));
    } else {
      editor.replaceSelection(`${open}${sel}${cl}`);
    }
  } else {
    const cursor = editor.getCursor();
    editor.replaceRange(`${open}${cl}`, cursor);
    editor.setCursor({ line: cursor.line, ch: cursor.ch + open.length });
  }
}

// ─── Sub / Sup toggle (cursor-aware, mutually exclusive) ─────────────────────

function toggleSubSup(editor: any, tag: "sub" | "sup"): void {
  const open  = `<${tag}>`;        // length 5
  const close = `</${tag}>`;       // length 6
  const otherTag   = tag === "sub" ? "sup" : "sub";
  const otherOpen  = `<${otherTag}>`;
  const otherClose = `</${otherTag}>`;

  const cursor = editor.getCursor();
  const line   = editor.getLine(cursor.line);
  const ch     = cursor.ch;

  // Returns the span {start, openEnd, closeStart, end} if ch falls inside it.
  // Active region matches updateRibbonState: ch > openLastCharIdx AND ch < closeEnd
  const findSpan = (ot: string, ct: string) => {
    const oLen = ot.length;
    const cLen = ct.length;
    let p = 0;
    while (p < line.length) {
      const o  = line.indexOf(ot, p);
      if (o  < 0) break;
      const c2 = line.indexOf(ct, o + oLen);
      if (c2 < 0) break;
      if (ch > o + oLen - 1 && ch < c2 + cLen) {
        return { start: o, openEnd: o + oLen, closeStart: c2, end: c2 + cLen };
      }
      p = c2 + cLen;
    }
    return null;
  };

  const thisSpan  = findSpan(open,      close);
  const otherSpan = findSpan(otherOpen, otherClose);

  if (thisSpan) {
    // Toggle off — strip tags, keep inner content
    const inner = line.slice(thisSpan.openEnd, thisSpan.closeStart);
    editor.setLine(cursor.line,
      line.slice(0, thisSpan.start) + inner + line.slice(thisSpan.end));
  } else if (otherSpan) {
    // Mutually exclusive — convert the other tag to this one
    const inner = line.slice(otherSpan.openEnd, otherSpan.closeStart);
    editor.setLine(cursor.line,
      line.slice(0, otherSpan.start) + open + inner + close + line.slice(otherSpan.end));
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

// ─── Line prefix toggle ───────────────────────────────────────────────────────

function toggleLinePrefix(editor: any, prefix: string): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  // For todo-style prefixes, also treat completed variants (- [x] / - [X] / - [✔] ) as "has prefix"
  let hasPrefix = line.startsWith(prefix);
  let actualPrefixLength = prefix.length;
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

// ─── HomeTab class ────────────────────────────────────────────────────────────

export class HomeTab {
  private stylesOffset = 0;

  render(container: HTMLElement, app: App): void {
    const panel = document.createElement("div");
    panel.className = "onr-tab-panel";
    panel.setAttribute("data-panel", "Home");
    panel.innerHTML = this.buildHTML();
    this.attachEvents(panel, app);
    container.appendChild(panel);
  }

  private buildHTML(): string {
    return `
      ${this.clipboardGroupHTML()}
      ${this.basicTextGroupHTML()}
      ${this.stylesGroupHTML()}
      ${this.tagsGroupHTML()}
      ${this.emailGroupHTML()}
      ${this.navigateGroupHTML()}
    `;
  }

  // ── CLIPBOARD ────────────────────────────────────────────────────
  private clipboardGroupHTML(): string {
    return `
      <div class="onr-group" data-group="Clipboard">
        <div class="onr-group-buttons" style="align-items:flex-start;gap:2px">
          <div style="display:flex;flex-direction:column;align-items:center;gap:0">
            <div class="onr-btn" data-cmd="paste" style="width:46px;min-height:46px;border-bottom:none;border-radius:3px 3px 0 0">
              <svg class="onr-icon" viewBox="0 0 24 24" style="width:24px;height:24px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1"/><polyline points="9 14 12 17 15 14"/><line x1="12" y1="10" x2="12" y2="17"/>
              </svg>
              <span class="onr-btn-label">Paste</span>
            </div>
            <div class="onr-btn-sm" data-cmd="paste-dropdown" style="width:46px;border-top:1px solid #d0d0d0;border-radius:0 0 3px 3px;min-height:14px;font-size:9px;justify-content:center">▾</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:1px;padding-top:2px">
            <div class="onr-btn-sm" data-cmd="cut" style="width:68px;flex-direction:row;gap:4px;padding:2px 4px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
              <span class="onr-btn-label-sm">Cut</span>
            </div>
            <div class="onr-btn-sm" data-cmd="copy" style="width:68px;flex-direction:row;gap:4px;padding:2px 4px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span class="onr-btn-label-sm">Copy</span>
            </div>
            <div class="onr-btn-sm" data-cmd="format-painter" style="width:68px;flex-direction:row;gap:4px;padding:2px 4px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              <span class="onr-btn-label-sm">Format Painter</span>
            </div>
          </div>
        </div>
        <div class="onr-group-name">Clipboard</div>
      </div>`;
  }

  // ── BASIC TEXT ────────────────────────────────────────────────────
  private basicTextGroupHTML(): string {
    return `
      <div class="onr-group" data-group="Basic Text">
        <div style="display:flex;flex-direction:column;gap:2px">
          <div class="onr-row" style="display:flex;align-items:center;gap:2px;padding:2px 0 0 0">
            <div class="onr-btn-sm onr-font-picker" data-cmd="font-family" style="width:96px;flex-direction:row;gap:2px;min-height:22px;padding:1px 4px;border:1px solid #c8c6c4;cursor:pointer">
              <span id="onr-font-label" style="font-size:10px;color:#222">Segoe UI</span>
              <span style="margin-left:auto;font-size:8px;color:#666">▾</span>
            </div>
            <div class="onr-btn-sm onr-font-picker" data-cmd="font-size" style="width:34px;flex-direction:row;min-height:22px;padding:1px 4px;border:1px solid #c8c6c4;cursor:pointer">
              <span id="onr-size-label" style="font-size:10px;color:#222">16</span>
              <span style="font-size:8px;color:#666">▾</span>
            </div>
            <div class="onr-btn-sm" data-cmd="bullet-list" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
              <span style="font-size:7px">▾</span>
            </div>
            <div class="onr-btn-sm" data-cmd="numbered-list" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" stroke-width="1.5"/><path d="M4 10h2" stroke="currentColor" stroke-width="1.5"/><path d="M6 14H4l2 2-2 2h2" stroke="currentColor" stroke-width="1.5"/></svg>
              <span style="font-size:7px">▾</span>
            </div>
            <div class="onr-btn-sm" data-cmd="outdent" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/></svg>
            </div>
            <div class="onr-btn-sm" data-cmd="indent" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 8 21 12 17 16"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="13" y2="6"/><line x1="3" y1="18" x2="13" y2="18"/></svg>
            </div>
            <div class="onr-btn-sm" data-cmd="clear-formatting" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
            </div>
          </div>
          <div class="onr-row" style="display:flex;align-items:center;gap:2px">
            <div class="onr-btn-sm" data-cmd="bold" style="min-height:22px;width:22px;font-weight:700;font-size:13px">B</div>
            <div class="onr-btn-sm" data-cmd="italic" style="min-height:22px;width:22px;font-style:italic;font-size:13px">I</div>
            <div class="onr-btn-sm" data-cmd="underline" style="min-height:22px;width:22px;text-decoration:underline;font-size:12px;font-weight:600">U</div>
            <div class="onr-btn-sm" data-cmd="strikethrough" style="min-height:22px;width:22px"><s style="font-size:11px">ab</s></div>
            <div class="onr-btn-sm" data-cmd="subscript" style="min-height:22px;width:22px;font-size:10px">x<sub style="font-size:7px">2</sub></div>
            <div class="onr-btn-sm" data-cmd="superscript" style="min-height:22px;width:22px;font-size:10px">x<sup style="font-size:7px">2</sup></div>
            <div style="width:1px;height:18px;background:#d0d0d0;margin:0 1px;flex-shrink:0"></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:0">
              <div class="onr-btn-sm" data-cmd="highlight" style="min-height:18px;width:26px;padding:1px 2px">
                <svg class="onr-icon-sm" viewBox="0 0 24 24" style="width:12px;height:12px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-6 6v3h3l6-6"/><path d="M22 5.54a2 2 0 0 0-2.83-2.83l-11.3 11.3 2.83 2.83L22 5.54z"/></svg>
                <div id="onr-highlight-swatch" style="width:14px;height:3px;background:#FFFF00;border:1px solid #ccc;margin-top:1px"></div>
              </div>
              <div style="font-size:7px;color:#666;line-height:1">▾</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:0">
              <div class="onr-btn-sm" data-cmd="font-color" style="min-height:18px;width:22px;padding:1px 2px">
                <span style="font-size:12px;font-weight:700;color:#222;line-height:1">A</span>
                <div id="onr-color-swatch" style="width:14px;height:3px;background:#FF0000;border:1px solid #ccc;margin-top:1px"></div>
              </div>
              <div style="font-size:7px;color:#666;line-height:1">▾</div>
            </div>
            <div style="width:1px;height:18px;background:#d0d0d0;margin:0 1px;flex-shrink:0"></div>
            <div class="onr-btn-sm" data-cmd="align" style="min-height:22px;width:26px;flex-direction:row;gap:1px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" style="width:10px;height:10px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>
              <span style="font-size:8px">▾</span>
            </div>
            <div class="onr-btn-sm" data-cmd="clear-inline" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>
        </div>
        <div class="onr-group-name">Basic Text</div>
      </div>`;
  }

  // ── STYLES ────────────────────────────────────────────────────────
  private stylesGroupHTML(): string {
    const s0 = STYLES_LIST[0];
    const s1 = STYLES_LIST[1];
    return `
      <div class="onr-group" data-group="Styles">
        <div style="display:flex;align-items:stretch;gap:0">
          <div style="display:flex;flex-direction:column;gap:2px;width:130px">
            <div class="onr-btn-sm" data-cmd="styles-preview-0" style="width:130px;min-height:28px;background:#1a1a2e;border:1px solid #555;border-radius:2px;flex-direction:row;justify-content:flex-start;padding:2px 8px">
              <span data-styles-text="0" style="${s0.style}">${s0.label}</span>
            </div>
            <div class="onr-btn-sm" data-cmd="styles-preview-1" style="width:130px;min-height:28px;background:#1a1a2e;border:1px solid #555;border-radius:2px;flex-direction:row;justify-content:flex-start;padding:2px 8px">
              <span data-styles-text="1" style="${s1.style}">${s1.label}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;justify-content:space-between;padding:2px 1px;gap:2px">
            <div class="onr-btn-sm" data-cmd="styles-scroll-up" style="width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center">▲</div>
            <div class="onr-btn-sm" data-cmd="styles-scroll-down" style="width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center">▼</div>
            <div class="onr-btn-sm" data-cmd="styles-dropdown" style="width:16px;min-height:14px;padding:0;font-size:9px;justify-content:center">▾</div>
          </div>
        </div>
        <div class="onr-group-name">Styles</div>
      </div>`;
  }

  // ── TAGS ──────────────────────────────────────────────────────────
  private tagsGroupHTML(): string {
    const top3 = ALL_TAGS.slice(0, 3);
    const rows = top3
      .map(
        (tag) => `
      <div class="onr-btn-sm onr-tag-row" data-cmd="${tag.cmd}" style="width:150px;min-height:20px;flex-direction:row;gap:4px;padding:1px 6px;justify-content:flex-start">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border-radius:2px;font-size:9px;flex-shrink:0;${tag.iconStyle}">${tag.icon}</span>
        <span class="onr-tag-label" style="font-size:10px;color:#222">${tag.label}</span>
        <div class="onr-tag-check" style="width:14px;height:14px;border:1px solid #999;margin-left:auto;background:#fff;flex-shrink:0;border-radius:1px;display:flex;align-items:center;justify-content:center"></div>
      </div>`,
      )
      .join("");

    return `
      <div class="onr-group" data-group="Tags">
        <div style="display:flex;gap:4px;align-items:flex-start">
          <div style="display:flex;flex-direction:column;gap:1px;width:150px">
            ${rows}
          </div>
          <div style="display:flex;flex-direction:column;justify-content:center;height:64px">
            <div class="onr-btn-sm" data-cmd="tags-dropdown" style="width:14px;min-height:64px;padding:0;font-size:9px;justify-content:center">▾</div>
          </div>
          <div class="onr-btn" data-cmd="todo-tag" style="width:46px;min-height:58px">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>
            <span class="onr-btn-label">To Do Tag</span>
          </div>
          <div class="onr-btn" data-cmd="find-tags" style="width:46px;min-height:58px">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            <span class="onr-btn-label">Find Tags</span>
          </div>
        </div>
        <div class="onr-group-name">Tags</div>
      </div>`;
  }

  // ── EMAIL & MEETINGS ──────────────────────────────────────────────
  private emailGroupHTML(): string {
    return `
      <div class="onr-group" data-group="Email &amp; Meetings">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="email-page">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span class="onr-btn-label">Email Page</span>
          </div>
          <div class="onr-btn" data-cmd="meeting-details">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
            <span class="onr-btn-label">Meeting Details</span>
          </div>
        </div>
        <div class="onr-group-name">Email &amp; Meetings</div>
      </div>`;
  }

  // ── NAVIGATE ──────────────────────────────────────────────────────
  private navigateGroupHTML(): string {
    return `
      <div class="onr-group" data-group="Navigate">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="outline">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span class="onr-btn-label">Outline</span>
          </div>
          <div class="onr-btn" data-cmd="fold-all">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 6 8 6 3"/><polyline points="3 16 6 16 6 21"/><line x1="21" y1="8" x2="6" y2="8"/><line x1="21" y1="16" x2="6" y2="16"/></svg>
            <span class="onr-btn-label">Fold All</span>
          </div>
          <div class="onr-btn" data-cmd="unfold-all">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 18 8 18 3"/><polyline points="21 16 18 16 18 21"/><line x1="3" y1="8" x2="18" y2="8"/><line x1="3" y1="16" x2="18" y2="16"/></svg>
            <span class="onr-btn-label">Unfold All</span>
          </div>
        </div>
        <div class="onr-group-name">Navigate</div>
      </div>`;
  }

  // ── EVENTS ────────────────────────────────────────────────────────
  private attachEvents(container: HTMLElement, app: App): void {
    container.querySelectorAll("[data-cmd]").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.executeCommand(
          el.getAttribute("data-cmd"),
          app,
          el as HTMLElement,
          container,
        );
      });
    });

    // Cursor-aware state tracking
    // Use capture-phase click/keyup on the workspace so we catch cursor movement
    // after the editor has processed the event (via requestAnimationFrame).
    const onEditorInteract = () => {
      requestAnimationFrame(() => this.updateRibbonState(container, app));
    };
    const workspaceEl =
      document.querySelector(".workspace") ?? document.body;
    workspaceEl.addEventListener("click", onEditorInteract, true);
    workspaceEl.addEventListener("keyup", onEditorInteract, true);

    // Format Painter: auto-apply when user finishes a drag-select (OneNote-style)
    workspaceEl.addEventListener("mouseup", (e) => {
      if (!(window as any)._onrFPActive) return;
      // If mouseup is on a ribbon button, let the click handler do phase 2 instead
      if ((e.target as Element)?.closest("[data-cmd]")) return;
      requestAnimationFrame(() => {
        const ed = app.workspace.activeEditor?.editor;
        const fp = (window as any)._onrFP as {
          headPrefix: string; isBold: boolean;
          isItalic: boolean; isUnderline: boolean;
        } | null;
        const sel = ed?.getSelection();

        // Always reset FP state regardless of whether we apply
        (window as any)._onrFPActive = false;
        (window as any)._onrFP = null;
        const fpBtn = (
          container.querySelector("[data-cmd=\"format-painter\"]") ??
          document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]')
        ) as HTMLElement | null;
        if (fpBtn) fpBtn.classList.remove("onr-active");

        if (!fp || !ed || !sel) return;
        // Apply inline formats
        let result = sel;
        if (fp.isUnderline) result = `<u>${result}</u>`;
        if (fp.isItalic) result = `*${result}*`;
        if (fp.isBold) result = `**${result}**`;
        ed.replaceSelection(result);
        if (fp.headPrefix) {
          const c = ed.getCursor();
          const l = ed.getLine(c.line);
          if (!l.startsWith(fp.headPrefix)) {
            ed.setLine(c.line, fp.headPrefix + l.replace(/^#{1,6}\s+/, ""));
          }
        }
      });
    }, true);

    // Also hook workspace events to handle leaf switches and content changes
    app.workspace.on("active-leaf-change", () => {
      setTimeout(() => this.updateRibbonState(container, app), 150);
    });
    app.workspace.on("editor-change", () => {
      requestAnimationFrame(() => this.updateRibbonState(container, app));
    });

    setTimeout(() => this.updateRibbonState(container, app), 300);
  }

  // ── UPDATE RIBBON STATE ──────────────────────────────────────────
  private updateRibbonState(panel: HTMLElement, app: App): void {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return;

    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);

    // Heading detection
    const headMatch = line.match(/^(#{1,6})\s/);
    const headLevel = headMatch ? headMatch[1].length : 0;

    // Scroll styles preview to show current heading
    if (headLevel >= 1 && headLevel <= 6) {
      const newOffset = Math.max(
        0,
        Math.min(headLevel - 1, STYLES_LIST.length - 2),
      );
      if (newOffset !== this.stylesOffset) {
        this.stylesOffset = newOffset;
        this.updateStylesPreview(panel);
      }
    }

    // Helper: toggle active class on a button
    const setActive = (cmd: string, active: boolean) => {
      const btn = panel.querySelector(`[data-cmd="${cmd}"]`) as HTMLElement;
      if (btn) btn.classList.toggle("onr-active", active);
    };

    // Strip HTML tags from line for markdown detection (handles spans wrapping **)
    const mdContent = line.replace(/<[^>]+>/g, "");

    // Inline formatting detection
    setActive("bold", /\*\*(.*?)\*\*/.test(mdContent));
    setActive("italic", /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(mdContent));
    setActive("underline", /<u>/.test(line));
    setActive("strikethrough", /~~(.*?)~~/.test(mdContent));
    setActive("highlight", /==(.*?)==/.test(mdContent));
    // sub/sup: only active when cursor is inside the tag span
    const ch = cursor.ch;
    const isInSub = (() => { let p = 0; while (p < line.length) { const o = line.indexOf("<sub>", p); if (o < 0) break; const c2 = line.indexOf("</sub>", o); if (c2 < 0) break; if (ch > o + 4 && ch < c2 + 6) return true; p = c2 + 6; } return false; })();
    const isInSup = (() => { let p = 0; while (p < line.length) { const o = line.indexOf("<sup>", p); if (o < 0) break; const c2 = line.indexOf("</sup>", o); if (c2 < 0) break; if (ch > o + 4 && ch < c2 + 6) return true; p = c2 + 6; } return false; })();
    setActive("subscript", isInSub);
    setActive("superscript", isInSup);

    // List type
    setActive("bullet-list", /^(\s*)- /.test(line));
    setActive("numbered-list", /^(\s*)\d+\. /.test(line));

    // Heading active state: highlight the matching styles preview card
    [0, 1].forEach((i) => {
      const card = panel.querySelector(
        `[data-cmd="styles-preview-${i}"]`,
      ) as HTMLElement;
      if (!card) return;
      const s = STYLES_LIST[this.stylesOffset + i];
      if (!s) { card.classList.remove("onr-active"); return; }
      const isActive =
        (headLevel > 0 && s.prefix === "#".repeat(headLevel) + " ") ||
        (headLevel === 0 && s.label === "Normal");
      card.classList.toggle("onr-active", isActive);
    });

    // Font/size from vault config
    const fontLabel = panel.querySelector("#onr-font-label") as HTMLElement;
    if (fontLabel) {
      const f = (app.vault as any).getConfig?.("fontText");
      if (f) fontLabel.textContent = f;
    }
    const sizeLabel = panel.querySelector("#onr-size-label") as HTMLElement;
    if (sizeLabel) {
      const s = (app.vault as any).getConfig?.("baseFontSize");
      if (s) sizeLabel.textContent = String(s);
    }

    // Tag checks
    this.refreshTagChecks(editor);
  }

  // ── UPDATE STYLES PREVIEW ────────────────────────────────────────
  private updateStylesPreview(panel: HTMLElement): void {
    [0, 1].forEach((i) => {
      const card = panel.querySelector(
        `[data-cmd="styles-preview-${i}"]`,
      ) as HTMLElement;
      if (!card) return;
      const item = STYLES_LIST[this.stylesOffset + i];
      if (!item) {
        card.style.display = "none";
        return;
      }
      card.style.display = "";
      const span = card.querySelector("span") as HTMLElement;
      if (span) {
        span.textContent = item.label;
        span.style.cssText = item.style;
      }
    });
  }

  private executeCommand(
    cmd: string | null,
    app: App,
    anchor?: HTMLElement,
    panel?: HTMLElement,
  ): void {
    if (!cmd) return;
    const editor = app.workspace.activeEditor?.editor;
    const exec = (id: string) => app.commands.executeCommandById(id);

    switch (cmd) {
      // ── Clipboard ────────────────────────────────────────────────
      case "paste": {
        if (editor) {
          navigator.clipboard
            .readText()
            .then((text) => {
              editor.replaceSelection(text);
            })
            .catch(() => {
              // Fallback: focus editor element and use keyboard shortcut
              const el =
                (editor as any).cm?.dom ??
                document.querySelector(".cm-content");
              if (el) {
                el.focus();
                document.execCommand("paste");
              }
            });
        }
        break;
      }
      case "paste-dropdown": {
        if (!anchor) break;
        showDropdown(anchor, [
          {
            label: "Paste",
            sublabel: "Ctrl+V",
            action: () => {
              if (editor)
                navigator.clipboard
                  .readText()
                  .then((t) => editor.replaceSelection(t));
            },
          },
          {
            label: "Paste as Plain Text",
            sublabel: "Ctrl+Shift+V",
            action: () => {
              if (editor)
                navigator.clipboard.readText().then((t) => {
                  // Strip HTML
                  const plain = t
                    .replace(/<[^>]+>/g, "")
                    .replace(/\r\n/g, "\n");
                  editor.replaceSelection(plain);
                });
            },
          },
          {
            label: "Paste Special...",
            disabled: true,
            action: () => {},
          },
        ]);
        break;
      }
      case "cut": {
        if (editor) {
          const sel = editor.getSelection();
          if (sel) {
            navigator.clipboard
              .writeText(sel)
              .then(() => editor.replaceSelection(""));
          }
        }
        break;
      }
      case "copy": {
        if (editor) {
          const sel = editor.getSelection();
          if (sel) navigator.clipboard.writeText(sel);
        }
        break;
      }

      // ── Basic Text ───────────────────────────────────────────────
      case "bold":
        if (editor) toggleInline(editor, "**");
        break;
      case "italic":
        if (editor) toggleInline(editor, "*");
        break;
      case "underline":
        if (editor) toggleInline(editor, "<u>", "</u>");
        break;
      case "strikethrough":
        if (editor) toggleInline(editor, "~~");
        break;
      case "highlight":
        if (editor) toggleInline(editor, "==");
        break;
      case "subscript":
        if (editor) toggleSubSup(editor, "sub");
        break;
      case "superscript":
        if (editor) toggleSubSup(editor, "sup");
        break;

      case "bullet-list":
        if (editor) toggleLinePrefix(editor, "- ");
        break;
      case "numbered-list":
        if (editor) toggleLinePrefix(editor, "1. ");
        break;
      case "indent":
        exec("editor:indent-list");
        break;
      case "outdent":
        exec("editor:unindent-list");
        break;

      case "clear-formatting": {
        if (!editor) break;
        const hasSel = !!editor.getSelection();
        const sel = hasSel
          ? editor.getSelection()
          : editor.getLine(editor.getCursor().line);
        const cleaned = sel
          .replace(/^#{1,6}\s+/gm, "")
          .replace(/\*\*(.*?)\*\*/gs, "$1")
          .replace(/\*(.*?)\*/gs, "$1")
          .replace(/_(.*?)_/gs, "$1")
          .replace(/~~(.*?)~~/gs, "$1")
          .replace(/==(.*?)==/gs, "$1")
          .replace(/`(.*?)`/gs, "$1")
          .replace(/<\/?[^>]+(>|$)/g, "");
        if (hasSel) editor.replaceSelection(cleaned);
        else editor.setLine(editor.getCursor().line, cleaned);
        break;
      }
      case "clear-inline": {
        if (!editor) break;
        const hasSel2 = !!editor.getSelection();
        const raw2 = hasSel2
          ? editor.getSelection()
          : editor.getLine(editor.getCursor().line);
        const cleaned2 = raw2
          .replace(/\*\*(.*?)\*\*/gs, "$1")
          .replace(/\*(.*?)\*/gs, "$1")
          .replace(/_(.*?)_/gs, "$1")
          .replace(/~~(.*?)~~/gs, "$1")
          .replace(/==(.*?)==/gs, "$1")
          .replace(/`(.*?)`/gs, "$1")
          .replace(/<\/?[^>]+(>|$)/g, "");
        if (hasSel2) editor.replaceSelection(cleaned2);
        else editor.setLine(editor.getCursor().line, cleaned2);
        break;
      }

      // ── Font family / size ───────────────────────────────────────
      case "font-family": {
        if (!anchor) break;
        const fonts = [
          "Segoe UI",
          "Arial",
          "Calibri",
          "Cambria",
          "Consolas",
          "Courier New",
          "Georgia",
          "Helvetica",
          "Times New Roman",
          "Trebuchet MS",
          "Verdana",
          "Comic Sans MS",
        ];
        showDropdown(
          anchor,
          fonts.map((f) => ({
            label: f,
            style: `font-family:${f};font-size:12px`,
            action: () => {
              const lbl = document.getElementById("onr-font-label");
              if (lbl) lbl.textContent = f;
              if (editor) {
                const sel = editor.getSelection();
                if (sel)
                  editor.replaceSelection(
                    `<span style="font-family:${f}">${sel}</span>`,
                  );
                else {
                  (app.vault as any).setConfig("fontText", f);
                  app.workspace.trigger("css-change");
                }
              }
            },
          })),
        );
        break;
      }
      case "font-size": {
        if (!anchor) break;
        const sizes = [
          8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72,
        ];
        showDropdown(
          anchor,
          sizes.map((s) => ({
            label: `${s}`,
            action: () => {
              const lbl = document.getElementById("onr-size-label");
              if (lbl) lbl.textContent = String(s);
              if (editor) {
                const sel = editor.getSelection();
                if (sel)
                  editor.replaceSelection(
                    `<span style="font-size:${s}px">${sel}</span>`,
                  );
                else {
                  (app.vault as any).setConfig("baseFontSize", s);
                  app.workspace.trigger("css-change");
                }
              }
            },
          })),
        );
        break;
      }
      case "font-color": {
        if (!anchor) break;
        const colors = [
          { label: "Black", hex: "#000000" },
          { label: "Dark Red", hex: "#C00000" },
          { label: "Red", hex: "#FF0000" },
          { label: "Orange", hex: "#FF6600" },
          { label: "Yellow", hex: "#FFFF00" },
          { label: "Green", hex: "#00B050" },
          { label: "Blue", hex: "#0070C0" },
          { label: "Purple", hex: "#7030A0" },
          { label: "White", hex: "#FFFFFF" },
          { label: "Gray", hex: "#808080" },
        ];
        showDropdown(
          anchor,
          colors.map((c) => ({
            label: c.label,
            style: `color:${c.hex};${c.hex === "#FFFFFF" ? "background:#333" : ""}`,
            action: () => {
              const sw = document.getElementById("onr-color-swatch");
              if (sw) sw.style.background = c.hex;
              if (editor) {
                const sel = editor.getSelection();
                if (sel)
                  editor.replaceSelection(
                    `<span style="color:${c.hex}">${sel}</span>`,
                  );
              }
            },
          })),
        );
        break;
      }

      // ── Align ────────────────────────────────────────────────────
      case "align": {
        if (!anchor) break;
        const alignOptions = [
          { label: "⇐  Align Left", align: "left", shortcut: "Ctrl+L" },
          { label: "⇔  Center", align: "center", shortcut: "Ctrl+E" },
          { label: "⇒  Align Right", align: "right", shortcut: "Ctrl+R" },
          { label: "⇔  Justify", align: "justify", shortcut: "Ctrl+J" },
        ];
        showDropdown(
          anchor,
          alignOptions.map((o) => ({
            label: o.label,
            sublabel: o.shortcut,
            action: () => {
              if (!editor) {
                new Notice("No active editor");
                return;
              }
              const sel = editor.getSelection();
              if (sel) {
                editor.replaceSelection(
                  `<div style="text-align:${o.align}">\n\n${sel}\n\n</div>`,
                );
              } else {
                const line = editor.getLine(editor.getCursor().line);
                editor.setLine(
                  editor.getCursor().line,
                  `<div style="text-align:${o.align}">${line}</div>`,
                );
              }
            },
          })),
        );
        break;
      }

      // ── Styles scroll ────────────────────────────────────────────
      case "styles-scroll-up": {
        if (this.stylesOffset > 0) {
          this.stylesOffset--;
          const p =
            panel ??
            (document.querySelector('[data-panel="Home"]') as HTMLElement);
          if (p) this.updateStylesPreview(p);
        }
        break;
      }
      case "styles-scroll-down": {
        if (this.stylesOffset < STYLES_LIST.length - 2) {
          this.stylesOffset++;
          const p =
            panel ??
            (document.querySelector('[data-panel="Home"]') as HTMLElement);
          if (p) this.updateStylesPreview(p);
        }
        break;
      }

      // ── Styles preview cards ─────────────────────────────────────
      case "styles-preview-0":
      case "styles-preview-1": {
        if (!editor) break;
        const idx =
          this.stylesOffset + (cmd === "styles-preview-0" ? 0 : 1);
        const s = STYLES_LIST[idx];
        if (!s) break;
        if (s.suffix) {
          const sel = editor.getSelection();
          editor.replaceSelection(`${s.prefix}${sel || ""}${s.suffix}`);
        } else if (s.prefix === "") {
          const cursor = editor.getCursor();
          const line = editor.getLine(cursor.line);
          editor.setLine(cursor.line, line.replace(/^#{1,6}\s+/, ""));
        } else {
          toggleLinePrefix(editor, s.prefix);
        }
        break;
      }

      // ── Styles dropdown ──────────────────────────────────────────
      case "styles-dropdown": {
        if (!anchor) break;
        showDropdown(
          anchor,
          [
            ...STYLES_LIST.map((s) => ({
              label: s.label,
              style: s.style + ";padding:4px 12px",
              action: () => {
                if (!editor) return;
                if (s.suffix) {
                  const sel = editor.getSelection();
                  editor.replaceSelection(
                    `${s.prefix}${sel || ""}${s.suffix}`,
                  );
                } else if (s.prefix === "") {
                  const cursor = editor.getCursor();
                  const line = editor.getLine(cursor.line);
                  editor.setLine(cursor.line, line.replace(/^#{1,6}\s+/, ""));
                } else {
                  toggleLinePrefix(editor, s.prefix);
                }
              },
            })),
            { label: "", divider: true, action: () => {} },
            {
              label: "🧹  Clear Formatting",
              style: "font-size:11px;color:#e0e0e0",
              action: () => {
                if (!editor) return;
                const hasSel3 = !!editor.getSelection();
                const raw3 = hasSel3
                  ? editor.getSelection()
                  : editor.getLine(editor.getCursor().line);
                const cleaned3 = raw3
                  .replace(/^#{1,6}\s+/gm, "")
                  .replace(/\*\*(.*?)\*\*/gs, "$1")
                  .replace(/\*(.*?)\*/gs, "$1")
                  .replace(/_(.*?)_/gs, "$1")
                  .replace(/~~(.*?)~~/gs, "$1")
                  .replace(/==(.*?)==/gs, "$1")
                  .replace(/`(.*?)`/gs, "$1")
                  .replace(/<\/?[^>]+(>|$)/g, "");
                if (hasSel3) editor.replaceSelection(cleaned3);
                else editor.setLine(editor.getCursor().line, cleaned3);
              },
            },
          ],
          { bg: "#1a1a2e", hoverBg: "#2a2a4e", color: "#e0e0e0" },
        );
        break;
      }

      // ── Tags ─────────────────────────────────────────────────────
      case "todo":
      case "todo-tag":
        if (editor) toggleLinePrefix(editor, "- [ ] ");
        break;

      case "tags-dropdown": {
        if (anchor) showTagsDropdown(anchor, app);
        break;
      }

      // Tag rows (visible on ribbon)
      default: {
        if (cmd.startsWith("tag-") && editor) {
          applyTag(cmd, editor);
          this.refreshTagChecks(editor);
        }
        break;
      }

      case "important":
        if (editor)
          editor.replaceRange("> [!important]\n> ", editor.getCursor());
        break;
      case "question":
        if (editor)
          editor.replaceRange("> [!question]\n> ", editor.getCursor());
        break;

      case "find-tags": {
        exec("global-search:open");
        setTimeout(() => {
          const input = document.querySelector(
            ".search-input-container input",
          ) as HTMLInputElement;
          if (input) {
            input.value = "#";
            input.dispatchEvent(new Event("input"));
          }
        }, 300);
        break;
      }
      case "email-page": {
        const content = editor?.getValue() ?? "";
        navigator.clipboard
          .writeText(content)
          .then(() => new Notice("Page content copied to clipboard"));
        break;
      }
      case "meeting-details": {
        if (!editor) break;
        const now = new Date();
        const tmpl = `---\nDate: ${now.toLocaleDateString()}\nTime: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\nAttendees: \nAgenda: \n---\n\n`;
        editor.replaceRange(tmpl, editor.getCursor());
        break;
      }
      case "outline":
        exec("outline:open");
        break;
      case "fold-all":
        exec("editor:fold-all");
        break;
      case "unfold-all":
        exec("editor:unfold-all");
        break;

      // ── Format Painter ───────────────────────────────────────────
      case "format-painter": {
        if (!editor || !anchor) break;

        // Phase 2: already active — apply stored format to current selection
        if ((window as any)._onrFPActive) {
          const stored = (window as any)._onrFP as {
            headPrefix: string; isBold: boolean;
            isItalic: boolean; isUnderline: boolean;
          } | null;
          const fpSel = editor.getSelection();
          if (stored && fpSel) {
            let result = fpSel;
            if (stored.isUnderline) result = `<u>${result}</u>`;
            if (stored.isItalic) result = `*${result}*`;
            if (stored.isBold) result = `**${result}**`;
            editor.replaceSelection(result);
            if (stored.headPrefix) {
              const fpCursor = editor.getCursor();
              const fpLine = editor.getLine(fpCursor.line);
              if (!fpLine.startsWith(stored.headPrefix)) {
                editor.setLine(
                  fpCursor.line,
                  stored.headPrefix + fpLine.replace(/^#{1,6}\s+/, ""),
                );
              }
            }
          } else if (stored && !fpSel) {
            new Notice("Format Painter: select text first, then click again");
            break; // Keep active — don't reset
          }
          (window as any)._onrFPActive = false;
          (window as any)._onrFP = null;
          anchor.classList.remove("onr-active");
          break;
        }

        // Phase 1: read formatting from current position
        const fpCursor = editor.getCursor();
        const fpLine = editor.getLine(fpCursor.line);
        const fpSel = editor.getSelection();
        const fpSrc = fpSel || fpLine;
        const fpHead = fpLine.match(/^(#{1,6} )/);
        (window as any)._onrFP = {
          headPrefix: fpHead ? fpHead[1] : "",
          isBold: /\*\*(.*?)\*\*/.test(fpSrc),
          isItalic: /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(fpSrc),
          isUnderline: /<u>/.test(fpSrc),
        };
        (window as any)._onrFPActive = true;
        anchor.classList.add("onr-active");
        new Notice("Format Painter: select target text then click again to apply");
        break;
      }
    }
  }

  /** Re-evaluate the 3 visible tag-row checkboxes against current line */
  private refreshTagChecks(editor: any): void {
    const lineText = editor.getLine(editor.getCursor().line);
    document
      .querySelectorAll('[data-panel="Home"] .onr-tag-row')
      .forEach((row) => {
        const cmd = row.getAttribute("data-cmd") ?? "";
        const notation = tagNotation(cmd);
        const check = row.querySelector(".onr-tag-check") as HTMLElement | null;
        if (!check || !notation) return;
        const active = lineText.includes(notation.split("\n")[0].trim());
        check.style.background = active ? "#4472C4" : "#fff";
        check.style.display = "flex";
        check.style.alignItems = "center";
        check.style.justifyContent = "center";
        check.innerHTML = active
          ? '<svg viewBox="0 0 12 12" style="width:10px;height:10px"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none"/></svg>'
          : "";
      });
  }
}
