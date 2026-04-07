"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => OneNoteRibbonPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/tabs/HomeTab.ts
var import_obsidian = require("obsidian");
var ALL_TAGS = [
  {
    label: "To Do",
    cmd: "tag-todo",
    icon: "\u2714",
    iconStyle: "background:#4472C4;color:#fff"
  },
  {
    label: "Important",
    cmd: "tag-important",
    icon: "\u2605",
    iconStyle: "background:#F5A623;color:#fff"
  },
  {
    label: "Question",
    cmd: "tag-question",
    icon: "?",
    iconStyle: "background:#7030A0;color:#fff"
  },
  {
    label: "Remember for later",
    cmd: "tag-remember",
    icon: "\u{1F514}",
    iconStyle: "background:#ED7D31;color:#fff"
  },
  {
    label: "Definition",
    cmd: "tag-definition",
    icon: "\u{1F4D6}",
    iconStyle: "background:#70AD47;color:#fff"
  },
  {
    label: "Highlight",
    cmd: "tag-highlight",
    icon: "\u270F",
    iconStyle: "background:#FFFF00;color:#333;border:1px solid #ccc"
  },
  {
    label: "Contact",
    cmd: "tag-contact",
    icon: "\u{1F464}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Address",
    cmd: "tag-address",
    icon: "\u{1F3E0}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Phone number",
    cmd: "tag-phone",
    icon: "\u{1F4DE}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Web site to visit",
    cmd: "tag-website",
    icon: "\u{1F310}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Idea",
    cmd: "tag-idea",
    icon: "\u{1F4A1}",
    iconStyle: "background:#FFD700;color:#333"
  },
  {
    label: "Password",
    cmd: "tag-password",
    icon: "\u{1F511}",
    iconStyle: "background:#808080;color:#fff"
  },
  {
    label: "Critical",
    cmd: "tag-critical",
    icon: "!",
    iconStyle: "background:#FF0000;color:#fff"
  },
  {
    label: "Project A",
    cmd: "tag-project-a",
    icon: " ",
    iconStyle: "background:#FF6B6B"
  },
  {
    label: "Project B",
    cmd: "tag-project-b",
    icon: " ",
    iconStyle: "background:#FFD700"
  },
  {
    label: "Movie to see",
    cmd: "tag-movie",
    icon: "\u{1F3AC}",
    iconStyle: "background:#333;color:#fff"
  },
  {
    label: "Book to read",
    cmd: "tag-book",
    icon: "\u{1F4DA}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Music to listen to",
    cmd: "tag-music",
    icon: "\u266A",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Source for article",
    cmd: "tag-source",
    icon: "\u{1F50D}",
    iconStyle: "background:#808080;color:#fff"
  },
  {
    label: "Remember for blog",
    cmd: "tag-blog",
    icon: "\u{1F4DD}",
    iconStyle: "background:#333;color:#fff"
  },
  {
    label: "Discuss with A",
    cmd: "tag-discuss-a",
    icon: "\u{1F4AC}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Discuss with B",
    cmd: "tag-discuss-b",
    icon: "\u{1F4AC}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Discuss w/ manager",
    cmd: "tag-discuss-mgr",
    icon: "\u{1F4AC}",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Send in email",
    cmd: "tag-email",
    icon: "\u2709",
    iconStyle: "background:#5B9BD5;color:#fff"
  },
  {
    label: "Schedule meeting",
    cmd: "tag-meeting",
    icon: "\u{1F4C5}",
    iconStyle: "background:#4472C4;color:#fff"
  },
  {
    label: "Call back",
    cmd: "tag-call",
    icon: "\u{1F4DE}",
    iconStyle: "background:#70AD47;color:#fff"
  },
  {
    label: "To Do priority 1",
    cmd: "tag-todo-p1",
    icon: "\u2714",
    iconStyle: "background:#4472C4;color:#fff"
  },
  {
    label: "To Do priority 2",
    cmd: "tag-todo-p2",
    icon: "\u2714",
    iconStyle: "background:#4472C4;color:#fff"
  }
];
var TAG_CMD_TO_DEF = {};
for (const t of ALL_TAGS)
  TAG_CMD_TO_DEF[t.cmd] = t;
var STYLES_LIST = [
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
  { label: "Normal", style: "font-size:12px;color:#e0e0e0", prefix: "" }
];
function tagNotation(cmd) {
  const map = {
    "tag-todo": "- [ ] ",
    "tag-todo-p1": "- [ ] \u{1F534} ",
    "tag-todo-p2": "- [ ] \u{1F7E1} ",
    "tag-important": "> [!important]\n> ",
    "tag-question": "> [!question]\n> ",
    "tag-remember": "> [!note] Remember for later\n> ",
    "tag-definition": "> [!info] Definition\n> ",
    "tag-highlight": "==",
    "tag-contact": "> [!tip] Contact\n> ",
    "tag-address": "> [!abstract] Address\n> ",
    "tag-phone": "> [!example] Phone\n> ",
    "tag-website": "> [!todo] Website\n> ",
    "tag-idea": "> [!tip] \u{1F4A1} Idea\n> ",
    "tag-password": "> [!warning] Password\n> ",
    "tag-critical": "> [!danger] Critical\n> ",
    "tag-project-a": "> [!failure] Project A\n> ",
    "tag-project-b": "> [!bug] Project B\n> ",
    "tag-movie": "> [!note] \u{1F3AC} Movie to see\n> ",
    "tag-book": "> [!note] \u{1F4DA} Book to read\n> ",
    "tag-music": "> [!note] \u266A Music\n> ",
    "tag-source": "> [!note] Source\n> ",
    "tag-blog": "> [!note] Blog\n> ",
    "tag-discuss-a": "> [!tip] Discuss with A\n> ",
    "tag-discuss-b": "> [!tip] Discuss with B\n> ",
    "tag-discuss-mgr": "> [!tip] Discuss with manager\n> ",
    "tag-email": "> [!todo] Send in email\n> ",
    "tag-meeting": "> [!todo] Schedule meeting\n> ",
    "tag-call": "> [!todo] Call back\n> "
  };
  return map[cmd] ?? "";
}
function showDropdown(anchor, items, opts) {
  document.querySelectorAll(".onr-overlay-dropdown").forEach((el) => el.remove());
  const menu = document.createElement("div");
  menu.className = "onr-overlay-dropdown";
  const menuBg = opts?.bg ?? "#fff";
  const hoverBg = opts?.hoverBg ?? "#f0eeec";
  const textColor = opts?.color ?? "#201f1e";
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
    ...needsScroll ? { maxHeight: "340px", overflowY: "auto" } : {}
  });
  for (const item of items) {
    if (item.divider) {
      const div = document.createElement("div");
      Object.assign(div.style, {
        borderTop: "1px solid #e1dfdd",
        margin: "2px 0"
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
      whiteSpace: "nowrap"
    });
    if (item.style)
      row.setAttribute("style", row.getAttribute("style") + ";" + item.style);
    row.textContent = item.label;
    if (item.sublabel) {
      const sub = document.createElement("span");
      sub.textContent = item.sublabel;
      sub.style.cssText = "font-size:10px;color:#605e5c;margin-left:auto;padding-left:16px";
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
  const rect = anchor.getBoundingClientRect();
  let top = rect.bottom + 2;
  let left = rect.left;
  const mh = needsScroll ? 340 : menu.scrollHeight || 200;
  if (top + mh > window.innerHeight)
    top = rect.top - mh - 2;
  if (left + 200 > window.innerWidth)
    left = window.innerWidth - 204;
  menu.style.top = top + "px";
  menu.style.left = left + "px";
  const close = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener("click", close, true);
    }
  };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}
function showTagsDropdown(anchor, app) {
  const editor = app.workspace.activeEditor?.editor;
  document.querySelectorAll(".onr-overlay-dropdown").forEach((el) => el.remove());
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
    overflowY: "auto"
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
      gap: "6px"
    });
    const iconEl = document.createElement("span");
    iconEl.textContent = tag.icon;
    iconEl.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:2px;font-size:10px;flex-shrink:0;${tag.iconStyle}`;
    const labelEl = document.createElement("span");
    labelEl.textContent = tag.label;
    labelEl.style.cssText = "flex:1;font-size:11px";
    const check = document.createElement("div");
    check.style.cssText = "width:16px;height:16px;border:1px solid #666;background:#333;flex-shrink:0;border-radius:1px;display:flex;align-items:center;justify-content:center";
    if (editor) {
      const lineText = editor.getLine(editor.getCursor().line);
      const notation = tagNotation(tag.cmd);
      if (notation && lineText.includes(notation.split("\n")[0].trim())) {
        check.style.background = "#4472C4";
        check.innerHTML = '<svg viewBox="0 0 12 12" style="width:10px;height:10px"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none"/></svg>';
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
      if (editor)
        applyTag(tag.cmd, editor);
    });
    menu.appendChild(row);
  }
  const div = document.createElement("div");
  div.style.cssText = "border-top:1px solid #555;margin:2px 0";
  menu.appendChild(div);
  const customRow = document.createElement("div");
  customRow.style.cssText = "padding:5px 8px;cursor:pointer;color:#888;font-size:11px;display:flex;align-items:center;gap:6px";
  customRow.innerHTML = '<span style="font-size:13px">\u{1F527}</span> Customize Tags...';
  customRow.addEventListener("click", () => {
    menu.remove();
    new import_obsidian.Notice("Customize Tags is not yet implemented");
  });
  menu.appendChild(customRow);
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  let top = rect.bottom + 2;
  let left = rect.left;
  if (top + 420 > window.innerHeight)
    top = Math.max(4, window.innerHeight - 424);
  if (left + 224 > window.innerWidth)
    left = window.innerWidth - 228;
  menu.style.top = top + "px";
  menu.style.left = left + "px";
  const close = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener("click", close, true);
    }
  };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}
function applyTag(cmd, editor) {
  const notation = tagNotation(cmd);
  if (!notation)
    return;
  if (cmd === "tag-highlight") {
    toggleInline(editor, "==");
    return;
  }
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const firstPart = notation.split("\n")[0];
  if (line.startsWith(firstPart)) {
    const notationLines = notation.split("\n");
    if (notationLines.length > 1) {
      editor.replaceRange(
        "",
        { line: cursor.line, ch: 0 },
        { line: cursor.line + 1, ch: 0 }
      );
      const contPrefix = notationLines[1];
      if (contPrefix) {
        const newLine = editor.getLine(cursor.line);
        if (newLine !== void 0 && newLine.startsWith(contPrefix)) {
          editor.setLine(cursor.line, newLine.slice(contPrefix.length));
        }
      }
    } else {
      editor.setLine(cursor.line, line.slice(firstPart.length));
    }
  } else if (cmd === "tag-todo" || cmd === "tag-todo-p1" || cmd === "tag-todo-p2") {
    toggleLinePrefix(editor, firstPart);
  } else {
    editor.replaceRange(notation, cursor);
  }
}
function toggleInline(editor, open, close) {
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
function toggleLinePrefix(editor, prefix) {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  let hasPrefix = line.startsWith(prefix);
  let actualPrefixLength = prefix.length;
  if (!hasPrefix && prefix.startsWith("- [ ] ")) {
    const rest = prefix.slice("- [ ] ".length);
    for (const v of ["- [x] ", "- [X] ", "- [\u2714] "]) {
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
      ""
    );
    editor.setLine(cursor.line, prefix + stripped);
  }
}
var HomeTab = class {
  constructor() {
    this.stylesOffset = 0;
  }
  render(container, app) {
    const panel = document.createElement("div");
    panel.className = "onr-tab-panel";
    panel.setAttribute("data-panel", "Home");
    panel.innerHTML = this.buildHTML();
    this.attachEvents(panel, app);
    container.appendChild(panel);
  }
  buildHTML() {
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
  clipboardGroupHTML() {
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
            <div class="onr-btn-sm" data-cmd="paste-dropdown" style="width:46px;border-top:1px solid #d0d0d0;border-radius:0 0 3px 3px;min-height:14px;font-size:9px;justify-content:center">\u25BE</div>
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
  basicTextGroupHTML() {
    return `
      <div class="onr-group" data-group="Basic Text">
        <div style="display:flex;flex-direction:column;gap:2px">
          <div class="onr-row" style="display:flex;align-items:center;gap:2px;padding:2px 0 0 0">
            <div class="onr-btn-sm onr-font-picker" data-cmd="font-family" style="width:96px;flex-direction:row;gap:2px;min-height:22px;padding:1px 4px;border:1px solid #c8c6c4;cursor:pointer">
              <span id="onr-font-label" style="font-size:10px;color:#222">Segoe UI</span>
              <span style="margin-left:auto;font-size:8px;color:#666">\u25BE</span>
            </div>
            <div class="onr-btn-sm onr-font-picker" data-cmd="font-size" style="width:34px;flex-direction:row;min-height:22px;padding:1px 4px;border:1px solid #c8c6c4;cursor:pointer">
              <span id="onr-size-label" style="font-size:10px;color:#222">16</span>
              <span style="font-size:8px;color:#666">\u25BE</span>
            </div>
            <div class="onr-btn-sm" data-cmd="bullet-list" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
              <span style="font-size:7px">\u25BE</span>
            </div>
            <div class="onr-btn-sm" data-cmd="numbered-list" style="min-height:22px;width:22px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" stroke-width="1.5"/><path d="M4 10h2" stroke="currentColor" stroke-width="1.5"/><path d="M6 14H4l2 2-2 2h2" stroke="currentColor" stroke-width="1.5"/></svg>
              <span style="font-size:7px">\u25BE</span>
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
              <div style="font-size:7px;color:#666;line-height:1">\u25BE</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:0">
              <div class="onr-btn-sm" data-cmd="font-color" style="min-height:18px;width:22px;padding:1px 2px">
                <span style="font-size:12px;font-weight:700;color:#222;line-height:1">A</span>
                <div id="onr-color-swatch" style="width:14px;height:3px;background:#FF0000;border:1px solid #ccc;margin-top:1px"></div>
              </div>
              <div style="font-size:7px;color:#666;line-height:1">\u25BE</div>
            </div>
            <div style="width:1px;height:18px;background:#d0d0d0;margin:0 1px;flex-shrink:0"></div>
            <div class="onr-btn-sm" data-cmd="align" style="min-height:22px;width:26px;flex-direction:row;gap:1px">
              <svg class="onr-icon-sm" viewBox="0 0 24 24" style="width:10px;height:10px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>
              <span style="font-size:8px">\u25BE</span>
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
  stylesGroupHTML() {
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
            <div class="onr-btn-sm" data-cmd="styles-scroll-up" style="width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center">\u25B2</div>
            <div class="onr-btn-sm" data-cmd="styles-scroll-down" style="width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center">\u25BC</div>
            <div class="onr-btn-sm" data-cmd="styles-dropdown" style="width:16px;min-height:14px;padding:0;font-size:9px;justify-content:center">\u25BE</div>
          </div>
        </div>
        <div class="onr-group-name">Styles</div>
      </div>`;
  }
  // ── TAGS ──────────────────────────────────────────────────────────
  tagsGroupHTML() {
    const top3 = ALL_TAGS.slice(0, 3);
    const rows = top3.map(
      (tag) => `
      <div class="onr-btn-sm onr-tag-row" data-cmd="${tag.cmd}" style="width:150px;min-height:20px;flex-direction:row;gap:4px;padding:1px 6px;justify-content:flex-start">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border-radius:2px;font-size:9px;flex-shrink:0;${tag.iconStyle}">${tag.icon}</span>
        <span class="onr-tag-label" style="font-size:10px;color:#222">${tag.label}</span>
        <div class="onr-tag-check" style="width:14px;height:14px;border:1px solid #999;margin-left:auto;background:#fff;flex-shrink:0;border-radius:1px;display:flex;align-items:center;justify-content:center"></div>
      </div>`
    ).join("");
    return `
      <div class="onr-group" data-group="Tags">
        <div style="display:flex;gap:4px;align-items:flex-start">
          <div style="display:flex;flex-direction:column;gap:1px;width:150px">
            ${rows}
          </div>
          <div style="display:flex;flex-direction:column;justify-content:center;height:64px">
            <div class="onr-btn-sm" data-cmd="tags-dropdown" style="width:14px;min-height:64px;padding:0;font-size:9px;justify-content:center">\u25BE</div>
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
  emailGroupHTML() {
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
  navigateGroupHTML() {
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
  attachEvents(container, app) {
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
          el,
          container
        );
      });
    });
    const onEditorInteract = () => {
      requestAnimationFrame(() => this.updateRibbonState(container, app));
    };
    const workspaceEl = document.querySelector(".workspace") ?? document.body;
    workspaceEl.addEventListener("click", onEditorInteract, true);
    workspaceEl.addEventListener("keyup", onEditorInteract, true);
    workspaceEl.addEventListener("mouseup", (e) => {
      if (!window._onrFPActive)
        return;
      if (e.target?.closest("[data-cmd]"))
        return;
      requestAnimationFrame(() => {
        const ed = app.workspace.activeEditor?.editor;
        const fp = window._onrFP;
        const sel = ed?.getSelection();
        window._onrFPActive = false;
        window._onrFP = null;
        const fpBtn = container.querySelector('[data-cmd="format-painter"]') ?? document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]');
        if (fpBtn)
          fpBtn.classList.remove("onr-active");
        if (!fp || !ed || !sel)
          return;
        let result = sel;
        if (fp.isUnderline)
          result = `<u>${result}</u>`;
        if (fp.isItalic)
          result = `*${result}*`;
        if (fp.isBold)
          result = `**${result}**`;
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
    app.workspace.on("active-leaf-change", () => {
      setTimeout(() => this.updateRibbonState(container, app), 150);
    });
    app.workspace.on("editor-change", () => {
      requestAnimationFrame(() => this.updateRibbonState(container, app));
    });
    setTimeout(() => this.updateRibbonState(container, app), 300);
  }
  // ── UPDATE RIBBON STATE ──────────────────────────────────────────
  updateRibbonState(panel, app) {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor)
      return;
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const headMatch = line.match(/^(#{1,6})\s/);
    const headLevel = headMatch ? headMatch[1].length : 0;
    if (headLevel >= 1 && headLevel <= 6) {
      const newOffset = Math.max(
        0,
        Math.min(headLevel - 1, STYLES_LIST.length - 2)
      );
      if (newOffset !== this.stylesOffset) {
        this.stylesOffset = newOffset;
        this.updateStylesPreview(panel);
      }
    }
    const setActive = (cmd, active) => {
      const btn = panel.querySelector(`[data-cmd="${cmd}"]`);
      if (btn)
        btn.classList.toggle("onr-active", active);
    };
    const mdContent = line.replace(/<[^>]+>/g, "");
    setActive("bold", /\*\*(.*?)\*\*/.test(mdContent));
    setActive("italic", /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(mdContent));
    setActive("underline", /<u>/.test(line));
    setActive("strikethrough", /~~(.*?)~~/.test(mdContent));
    setActive("highlight", /==(.*?)==/.test(mdContent));
    const ch = cursor.ch;
    const isInSub = (() => {
      let p = 0;
      while (p < line.length) {
        const o = line.indexOf("<sub>", p);
        if (o < 0)
          break;
        const c2 = line.indexOf("</sub>", o);
        if (c2 < 0)
          break;
        if (ch > o + 4 && ch < c2 + 6)
          return true;
        p = c2 + 6;
      }
      return false;
    })();
    const isInSup = (() => {
      let p = 0;
      while (p < line.length) {
        const o = line.indexOf("<sup>", p);
        if (o < 0)
          break;
        const c2 = line.indexOf("</sup>", o);
        if (c2 < 0)
          break;
        if (ch > o + 4 && ch < c2 + 6)
          return true;
        p = c2 + 6;
      }
      return false;
    })();
    setActive("subscript", isInSub);
    setActive("superscript", isInSup);
    setActive("bullet-list", /^(\s*)- /.test(line));
    setActive("numbered-list", /^(\s*)\d+\. /.test(line));
    [0, 1].forEach((i) => {
      const card = panel.querySelector(
        `[data-cmd="styles-preview-${i}"]`
      );
      if (!card)
        return;
      const s = STYLES_LIST[this.stylesOffset + i];
      if (!s) {
        card.classList.remove("onr-active");
        return;
      }
      const isActive = headLevel > 0 && s.prefix === "#".repeat(headLevel) + " " || headLevel === 0 && s.label === "Normal";
      card.classList.toggle("onr-active", isActive);
    });
    const fontLabel = panel.querySelector("#onr-font-label");
    if (fontLabel) {
      const f = app.vault.getConfig?.("fontText");
      if (f)
        fontLabel.textContent = f;
    }
    const sizeLabel = panel.querySelector("#onr-size-label");
    if (sizeLabel) {
      const s = app.vault.getConfig?.("baseFontSize");
      if (s)
        sizeLabel.textContent = String(s);
    }
    this.refreshTagChecks(editor);
  }
  // ── UPDATE STYLES PREVIEW ────────────────────────────────────────
  updateStylesPreview(panel) {
    [0, 1].forEach((i) => {
      const card = panel.querySelector(
        `[data-cmd="styles-preview-${i}"]`
      );
      if (!card)
        return;
      const item = STYLES_LIST[this.stylesOffset + i];
      if (!item) {
        card.style.display = "none";
        return;
      }
      card.style.display = "";
      const span = card.querySelector("span");
      if (span) {
        span.textContent = item.label;
        span.style.cssText = item.style;
      }
    });
  }
  executeCommand(cmd, app, anchor, panel) {
    if (!cmd)
      return;
    const editor = app.workspace.activeEditor?.editor;
    const exec = (id) => app.commands.executeCommandById(id);
    switch (cmd) {
      case "paste": {
        if (editor) {
          navigator.clipboard.readText().then((text) => {
            editor.replaceSelection(text);
          }).catch(() => {
            const el = editor.cm?.dom ?? document.querySelector(".cm-content");
            if (el) {
              el.focus();
              document.execCommand("paste");
            }
          });
        }
        break;
      }
      case "paste-dropdown": {
        if (!anchor)
          break;
        showDropdown(anchor, [
          {
            label: "Paste",
            sublabel: "Ctrl+V",
            action: () => {
              if (editor)
                navigator.clipboard.readText().then((t) => editor.replaceSelection(t));
            }
          },
          {
            label: "Paste as Plain Text",
            sublabel: "Ctrl+Shift+V",
            action: () => {
              if (editor)
                navigator.clipboard.readText().then((t) => {
                  const plain = t.replace(/<[^>]+>/g, "").replace(/\r\n/g, "\n");
                  editor.replaceSelection(plain);
                });
            }
          },
          {
            label: "Paste Special...",
            disabled: true,
            action: () => {
            }
          }
        ]);
        break;
      }
      case "cut": {
        if (editor) {
          const sel = editor.getSelection();
          if (sel) {
            navigator.clipboard.writeText(sel).then(() => editor.replaceSelection(""));
          }
        }
        break;
      }
      case "copy": {
        if (editor) {
          const sel = editor.getSelection();
          if (sel)
            navigator.clipboard.writeText(sel);
        }
        break;
      }
      case "bold":
        if (editor)
          toggleInline(editor, "**");
        break;
      case "italic":
        if (editor)
          toggleInline(editor, "*");
        break;
      case "underline":
        if (editor)
          toggleInline(editor, "<u>", "</u>");
        break;
      case "strikethrough":
        if (editor)
          toggleInline(editor, "~~");
        break;
      case "highlight":
        if (editor)
          toggleInline(editor, "==");
        break;
      case "subscript":
        if (editor)
          toggleInline(editor, "<sub>", "</sub>");
        break;
      case "superscript":
        if (editor)
          toggleInline(editor, "<sup>", "</sup>");
        break;
      case "bullet-list":
        if (editor)
          toggleLinePrefix(editor, "- ");
        break;
      case "numbered-list":
        if (editor)
          toggleLinePrefix(editor, "1. ");
        break;
      case "indent":
        exec("editor:indent-list");
        break;
      case "outdent":
        exec("editor:unindent-list");
        break;
      case "clear-formatting": {
        if (!editor)
          break;
        const hasSel = !!editor.getSelection();
        const sel = hasSel ? editor.getSelection() : editor.getLine(editor.getCursor().line);
        const cleaned = sel.replace(/^#{1,6}\s+/gm, "").replace(/\*\*(.*?)\*\*/gs, "$1").replace(/\*(.*?)\*/gs, "$1").replace(/_(.*?)_/gs, "$1").replace(/~~(.*?)~~/gs, "$1").replace(/==(.*?)==/gs, "$1").replace(/`(.*?)`/gs, "$1").replace(/<\/?[^>]+(>|$)/g, "");
        if (hasSel)
          editor.replaceSelection(cleaned);
        else
          editor.setLine(editor.getCursor().line, cleaned);
        break;
      }
      case "clear-inline": {
        if (!editor)
          break;
        const hasSel2 = !!editor.getSelection();
        const raw2 = hasSel2 ? editor.getSelection() : editor.getLine(editor.getCursor().line);
        const cleaned2 = raw2.replace(/\*\*(.*?)\*\*/gs, "$1").replace(/\*(.*?)\*/gs, "$1").replace(/_(.*?)_/gs, "$1").replace(/~~(.*?)~~/gs, "$1").replace(/==(.*?)==/gs, "$1").replace(/`(.*?)`/gs, "$1").replace(/<\/?[^>]+(>|$)/g, "");
        if (hasSel2)
          editor.replaceSelection(cleaned2);
        else
          editor.setLine(editor.getCursor().line, cleaned2);
        break;
      }
      case "font-family": {
        if (!anchor)
          break;
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
          "Comic Sans MS"
        ];
        showDropdown(
          anchor,
          fonts.map((f) => ({
            label: f,
            style: `font-family:${f};font-size:12px`,
            action: () => {
              const lbl = document.getElementById("onr-font-label");
              if (lbl)
                lbl.textContent = f;
              if (editor) {
                const sel = editor.getSelection();
                if (sel)
                  editor.replaceSelection(
                    `<span style="font-family:${f}">${sel}</span>`
                  );
                else {
                  app.vault.setConfig("fontText", f);
                  app.workspace.trigger("css-change");
                }
              }
            }
          }))
        );
        break;
      }
      case "font-size": {
        if (!anchor)
          break;
        const sizes = [
          8,
          9,
          10,
          11,
          12,
          14,
          16,
          18,
          20,
          22,
          24,
          28,
          32,
          36,
          48,
          72
        ];
        showDropdown(
          anchor,
          sizes.map((s) => ({
            label: `${s}`,
            action: () => {
              const lbl = document.getElementById("onr-size-label");
              if (lbl)
                lbl.textContent = String(s);
              if (editor) {
                const sel = editor.getSelection();
                if (sel)
                  editor.replaceSelection(
                    `<span style="font-size:${s}px">${sel}</span>`
                  );
                else {
                  app.vault.setConfig("baseFontSize", s);
                  app.workspace.trigger("css-change");
                }
              }
            }
          }))
        );
        break;
      }
      case "font-color": {
        if (!anchor)
          break;
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
          { label: "Gray", hex: "#808080" }
        ];
        showDropdown(
          anchor,
          colors.map((c) => ({
            label: c.label,
            style: `color:${c.hex};${c.hex === "#FFFFFF" ? "background:#333" : ""}`,
            action: () => {
              const sw = document.getElementById("onr-color-swatch");
              if (sw)
                sw.style.background = c.hex;
              if (editor) {
                const sel = editor.getSelection();
                if (sel)
                  editor.replaceSelection(
                    `<span style="color:${c.hex}">${sel}</span>`
                  );
              }
            }
          }))
        );
        break;
      }
      case "align": {
        if (!anchor)
          break;
        const alignOptions = [
          { label: "\u21D0  Align Left", align: "left", shortcut: "Ctrl+L" },
          { label: "\u21D4  Center", align: "center", shortcut: "Ctrl+E" },
          { label: "\u21D2  Align Right", align: "right", shortcut: "Ctrl+R" },
          { label: "\u21D4  Justify", align: "justify", shortcut: "Ctrl+J" }
        ];
        showDropdown(
          anchor,
          alignOptions.map((o) => ({
            label: o.label,
            sublabel: o.shortcut,
            action: () => {
              if (!editor) {
                new import_obsidian.Notice("No active editor");
                return;
              }
              const sel = editor.getSelection();
              if (sel) {
                editor.replaceSelection(
                  `<div style="text-align:${o.align}">

${sel}

</div>`
                );
              } else {
                const line = editor.getLine(editor.getCursor().line);
                editor.setLine(
                  editor.getCursor().line,
                  `<div style="text-align:${o.align}">${line}</div>`
                );
              }
            }
          }))
        );
        break;
      }
      case "styles-scroll-up": {
        if (this.stylesOffset > 0) {
          this.stylesOffset--;
          const p = panel ?? document.querySelector('[data-panel="Home"]');
          if (p)
            this.updateStylesPreview(p);
        }
        break;
      }
      case "styles-scroll-down": {
        if (this.stylesOffset < STYLES_LIST.length - 2) {
          this.stylesOffset++;
          const p = panel ?? document.querySelector('[data-panel="Home"]');
          if (p)
            this.updateStylesPreview(p);
        }
        break;
      }
      case "styles-preview-0":
      case "styles-preview-1": {
        if (!editor)
          break;
        const idx = this.stylesOffset + (cmd === "styles-preview-0" ? 0 : 1);
        const s = STYLES_LIST[idx];
        if (!s)
          break;
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
      case "styles-dropdown": {
        if (!anchor)
          break;
        showDropdown(
          anchor,
          [
            ...STYLES_LIST.map((s) => ({
              label: s.label,
              style: s.style + ";padding:4px 12px",
              action: () => {
                if (!editor)
                  return;
                if (s.suffix) {
                  const sel = editor.getSelection();
                  editor.replaceSelection(
                    `${s.prefix}${sel || ""}${s.suffix}`
                  );
                } else if (s.prefix === "") {
                  const cursor = editor.getCursor();
                  const line = editor.getLine(cursor.line);
                  editor.setLine(cursor.line, line.replace(/^#{1,6}\s+/, ""));
                } else {
                  toggleLinePrefix(editor, s.prefix);
                }
              }
            })),
            { label: "", divider: true, action: () => {
            } },
            {
              label: "\u{1F9F9}  Clear Formatting",
              style: "font-size:11px;color:#e0e0e0",
              action: () => {
                if (!editor)
                  return;
                const hasSel3 = !!editor.getSelection();
                const raw3 = hasSel3 ? editor.getSelection() : editor.getLine(editor.getCursor().line);
                const cleaned3 = raw3.replace(/^#{1,6}\s+/gm, "").replace(/\*\*(.*?)\*\*/gs, "$1").replace(/\*(.*?)\*/gs, "$1").replace(/_(.*?)_/gs, "$1").replace(/~~(.*?)~~/gs, "$1").replace(/==(.*?)==/gs, "$1").replace(/`(.*?)`/gs, "$1").replace(/<\/?[^>]+(>|$)/g, "");
                if (hasSel3)
                  editor.replaceSelection(cleaned3);
                else
                  editor.setLine(editor.getCursor().line, cleaned3);
              }
            }
          ],
          { bg: "#1a1a2e", hoverBg: "#2a2a4e", color: "#e0e0e0" }
        );
        break;
      }
      case "todo":
      case "todo-tag":
        if (editor)
          toggleLinePrefix(editor, "- [ ] ");
        break;
      case "tags-dropdown": {
        if (anchor)
          showTagsDropdown(anchor, app);
        break;
      }
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
            ".search-input-container input"
          );
          if (input) {
            input.value = "#";
            input.dispatchEvent(new Event("input"));
          }
        }, 300);
        break;
      }
      case "email-page": {
        const content = editor?.getValue() ?? "";
        navigator.clipboard.writeText(content).then(() => new import_obsidian.Notice("Page content copied to clipboard"));
        break;
      }
      case "meeting-details": {
        if (!editor)
          break;
        const now = /* @__PURE__ */ new Date();
        const tmpl = `---
Date: ${now.toLocaleDateString()}
Time: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
Attendees: 
Agenda: 
---

`;
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
      case "format-painter": {
        if (!editor || !anchor)
          break;
        if (window._onrFPActive) {
          const stored = window._onrFP;
          const fpSel2 = editor.getSelection();
          if (stored && fpSel2) {
            let result = fpSel2;
            if (stored.isUnderline)
              result = `<u>${result}</u>`;
            if (stored.isItalic)
              result = `*${result}*`;
            if (stored.isBold)
              result = `**${result}**`;
            editor.replaceSelection(result);
            if (stored.headPrefix) {
              const fpCursor2 = editor.getCursor();
              const fpLine2 = editor.getLine(fpCursor2.line);
              if (!fpLine2.startsWith(stored.headPrefix)) {
                editor.setLine(
                  fpCursor2.line,
                  stored.headPrefix + fpLine2.replace(/^#{1,6}\s+/, "")
                );
              }
            }
          } else if (stored && !fpSel2) {
            new import_obsidian.Notice("Format Painter: select text first, then click again");
            break;
          }
          window._onrFPActive = false;
          window._onrFP = null;
          anchor.classList.remove("onr-active");
          break;
        }
        const fpCursor = editor.getCursor();
        const fpLine = editor.getLine(fpCursor.line);
        const fpSel = editor.getSelection();
        const fpSrc = fpSel || fpLine;
        const fpHead = fpLine.match(/^(#{1,6} )/);
        window._onrFP = {
          headPrefix: fpHead ? fpHead[1] : "",
          isBold: /\*\*(.*?)\*\*/.test(fpSrc),
          isItalic: /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(fpSrc),
          isUnderline: /<u>/.test(fpSrc)
        };
        window._onrFPActive = true;
        anchor.classList.add("onr-active");
        new import_obsidian.Notice("Format Painter: select target text then click again to apply");
        break;
      }
    }
  }
  /** Re-evaluate the 3 visible tag-row checkboxes against current line */
  refreshTagChecks(editor) {
    const lineText = editor.getLine(editor.getCursor().line);
    document.querySelectorAll('[data-panel="Home"] .onr-tag-row').forEach((row) => {
      const cmd = row.getAttribute("data-cmd") ?? "";
      const notation = tagNotation(cmd);
      const check = row.querySelector(".onr-tag-check");
      if (!check || !notation)
        return;
      const active = lineText.includes(notation.split("\n")[0].trim());
      check.style.background = active ? "#4472C4" : "#fff";
      check.style.display = "flex";
      check.style.alignItems = "center";
      check.style.justifyContent = "center";
      check.innerHTML = active ? '<svg viewBox="0 0 12 12" style="width:10px;height:10px"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none"/></svg>' : "";
    });
  }
};

// src/tabs/InsertTab.ts
var import_obsidian2 = require("obsidian");
var CALLOUT_TYPES = [
  "note",
  "abstract",
  "info",
  "tip",
  "success",
  "question",
  "warning",
  "failure",
  "danger",
  "bug",
  "example",
  "quote"
];
var InsertTab = class {
  render(container, app) {
    const panel = container.createDiv();
    panel.addClass("onr-tab-panel");
    panel.setAttribute("data-panel", "Insert");
    panel.style.display = "none";
    panel.innerHTML = this.buildHTML();
    this.attachEvents(panel, app);
    container.appendChild(panel);
  }
  buildHTML() {
    return `
      ${this.insertGroupHTML()}
      ${this.tablesGroupHTML()}
      ${this.filesGroupHTML()}
      ${this.imagesGroupHTML()}
      ${this.linksGroupHTML()}
      ${this.timeStampGroupHTML()}
      ${this.blocksGroupHTML()}
      ${this.symbolsGroupHTML()}
    `;
  }
  // ── INSERT ────────────────────────────────────────────────────────
  insertGroupHTML() {
    return `
      <div class="onr-group" data-group="Insert">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="blank-line">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span class="onr-btn-label">Blank Line</span>
          </div>
        </div>
        <div class="onr-group-name">Insert</div>
      </div>`;
  }
  // ── TABLES ────────────────────────────────────────────────────────
  tablesGroupHTML() {
    return `
      <div class="onr-group" data-group="Tables">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="insert-table">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
            </svg>
            <span class="onr-btn-label">Table</span>
          </div>
        </div>
        <div class="onr-group-name">Tables</div>
      </div>`;
  }
  // ── FILES ─────────────────────────────────────────────────────────
  filesGroupHTML() {
    return `
      <div class="onr-group" data-group="Files">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="attach-file">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            <span class="onr-btn-label">Attach File</span>
          </div>
          <div class="onr-btn" data-cmd="embed-note">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M2 15h10"/><path d="M9 12l3 3-3 3"/>
            </svg>
            <span class="onr-btn-label">Embed Note</span>
          </div>
        </div>
        <div class="onr-group-name">Files</div>
      </div>`;
  }
  // ── IMAGES ────────────────────────────────────────────────────────
  imagesGroupHTML() {
    return `
      <div class="onr-group" data-group="Images">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="insert-image">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="onr-btn-label">Image</span>
          </div>
          <div class="onr-btn" data-cmd="insert-video">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            <span class="onr-btn-label">Video</span>
          </div>
        </div>
        <div class="onr-group-name">Images</div>
      </div>`;
  }
  // ── LINKS ─────────────────────────────────────────────────────────
  linksGroupHTML() {
    return `
      <div class="onr-group" data-group="Links">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="insert-link">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span class="onr-btn-label">Link</span>
          </div>
          <div class="onr-btn" data-cmd="insert-wikilink">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M2 15h10"/><path d="M9 12l3 3-3 3"/>
            </svg>
            <span class="onr-btn-label">[[Wikilink]]</span>
          </div>
        </div>
        <div class="onr-group-name">Links</div>
      </div>`;
  }
  // ── TIME STAMP ────────────────────────────────────────────────────
  timeStampGroupHTML() {
    return `
      <div class="onr-group" data-group="Time Stamp">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="insert-date">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="onr-btn-label">Date</span>
          </div>
          <div class="onr-btn" data-cmd="insert-time">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span class="onr-btn-label">Time</span>
          </div>
          <div class="onr-btn" data-cmd="insert-datetime">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/>
              <path d="M16 2v4M8 2v4M3 10h5"/>
              <circle cx="17.5" cy="17.5" r="4.5"/>
              <polyline points="17.5 15.5 17.5 17.5 19 18.5"/>
            </svg>
            <span class="onr-btn-label">Date &amp; Time</span>
          </div>
        </div>
        <div class="onr-group-name">Time Stamp</div>
      </div>`;
  }
  // ── BLOCKS ────────────────────────────────────────────────────────
  blocksGroupHTML() {
    return `
      <div class="onr-group" data-group="Blocks">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="insert-template">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="5" rx="1"/>
              <rect x="3" y="12" width="4" height="9" rx="1"/>
              <rect x="11" y="12" width="10" height="9" rx="1"/>
            </svg>
            <span class="onr-btn-label">Template</span>
          </div>
          <div class="onr-btn" data-cmd="insert-callout">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 11l19-9v18L3 13"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
            </svg>
            <span class="onr-btn-label">Callout</span>
          </div>
          <div class="onr-btn" data-cmd="insert-code-block">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <span class="onr-btn-label">Code Block</span>
          </div>
        </div>
        <div class="onr-group-name">Blocks</div>
      </div>`;
  }
  // ── SYMBOLS ───────────────────────────────────────────────────────
  symbolsGroupHTML() {
    return `
      <div class="onr-group" data-group="Symbols">
        <div class="onr-group-buttons">
          <div class="onr-btn" data-cmd="insert-math">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 7H5l7 5-7 5h13"/>
            </svg>
            <span class="onr-btn-label">Math $$</span>
          </div>
          <div class="onr-btn" data-cmd="insert-hr">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span class="onr-btn-label">Horizontal Rule</span>
          </div>
          <div class="onr-btn" data-cmd="insert-footnote">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 10 20 15 15 20"/>
              <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
            </svg>
            <span class="onr-btn-label">Footnote</span>
          </div>
          <div class="onr-btn" data-cmd="insert-tag">
            <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="9" x2="20" y2="9"/>
              <line x1="4" y1="15" x2="20" y2="15"/>
              <line x1="10" y1="3" x2="8" y2="21"/>
              <line x1="16" y1="3" x2="14" y2="21"/>
            </svg>
            <span class="onr-btn-label">#Tag</span>
          </div>
        </div>
        <div class="onr-group-name">Symbols</div>
      </div>`;
  }
  // ── EVENTS ────────────────────────────────────────────────────────
  attachEvents(container, app) {
    container.querySelectorAll("[data-cmd]").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.executeCommand(el.getAttribute("data-cmd"), app, container);
      });
    });
  }
  executeCommand(cmd, app, container) {
    if (!cmd)
      return;
    const editor = app.workspace.activeEditor?.editor;
    const insertAtCursor = (text, offsetBack = 0) => {
      if (!editor)
        return;
      const cursor = editor.getCursor();
      editor.replaceRange(text, cursor);
      if (offsetBack > 0) {
        const newLine = cursor.line + text.split("\n").length - 1;
        const lines = text.split("\n");
        const newCh = offsetBack === 0 ? cursor.ch + text.length : lines[lines.length - 1].length - offsetBack;
        editor.setCursor({ line: newLine, ch: newCh });
      }
    };
    const fmtDate = () => {
      const m = window.moment;
      return m ? m().format("YYYY-MM-DD") : (() => {
        const d = /* @__PURE__ */ new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })();
    };
    const fmtTime = () => {
      const m = window.moment;
      return m ? m().format("HH:mm") : (() => {
        const d = /* @__PURE__ */ new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      })();
    };
    switch (cmd) {
      case "blank-line":
        insertAtCursor("\n");
        break;
      case "insert-table": {
        if (!editor)
          return;
        const table = "\n| col | col | col |\n|---|---|---|\n| | | |\n";
        insertAtCursor(table);
        break;
      }
      case "attach-file":
      case "embed-note": {
        if (!editor)
          return;
        const cursor = editor.getCursor();
        editor.replaceRange("![[]]", cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
        break;
      }
      case "insert-image": {
        if (!editor)
          return;
        const cursor = editor.getCursor();
        editor.replaceRange("![[]]", cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
        break;
      }
      case "insert-video": {
        if (!editor)
          return;
        const tpl = '\n<iframe src="" width="560" height="315" frameborder="0" allowfullscreen></iframe>\n';
        const cursor = editor.getCursor();
        editor.replaceRange(tpl, cursor);
        break;
      }
      case "insert-link": {
        if (!editor)
          return;
        const sel = editor.getSelection();
        const cursor = editor.getCursor();
        if (sel) {
          editor.replaceSelection(`[${sel}]()`);
          const newCursor = editor.getCursor();
          editor.setCursor({ line: newCursor.line, ch: newCursor.ch - 1 });
        } else {
          editor.replaceRange("[]()", cursor);
          editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
        }
        break;
      }
      case "insert-wikilink": {
        if (!editor)
          return;
        const cursor = editor.getCursor();
        editor.replaceRange("[[]]", cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
        break;
      }
      case "insert-date":
        insertAtCursor(fmtDate());
        break;
      case "insert-time":
        insertAtCursor(fmtTime());
        break;
      case "insert-datetime":
        insertAtCursor(`${fmtDate()} ${fmtTime()}`);
        break;
      case "insert-template": {
        const result = app.commands.executeCommandById("insert-template");
        if (!result) {
          new import_obsidian2.Notice("Enable the Templates or Templater plugin to use this feature");
        }
        break;
      }
      case "insert-callout":
        this.showCalloutPicker(editor, container);
        break;
      case "insert-code-block": {
        if (!editor)
          return;
        const cursor = editor.getCursor();
        const block = "```\n\n```";
        editor.replaceRange(block, cursor);
        editor.setCursor({ line: cursor.line + 1, ch: 0 });
        break;
      }
      case "insert-math": {
        if (!editor)
          return;
        const cursor = editor.getCursor();
        editor.replaceRange("$$\n\n$$", cursor);
        editor.setCursor({ line: cursor.line + 1, ch: 0 });
        break;
      }
      case "insert-hr":
        insertAtCursor("\n---\n");
        break;
      case "insert-footnote": {
        if (!editor)
          return;
        const cursor = editor.getCursor();
        editor.replaceRange("[^1]", cursor);
        const lastLine = editor.lastLine();
        const endPos = { line: lastLine, ch: editor.getLine(lastLine).length };
        editor.replaceRange("\n[^1]: ", endPos);
        break;
      }
      case "insert-tag": {
        if (!editor)
          return;
        const cursor = editor.getCursor();
        editor.replaceRange("#", cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
        break;
      }
    }
  }
  showCalloutPicker(editor, container) {
    container.querySelector(".onr-callout-picker")?.remove();
    const picker = document.createElement("div");
    picker.className = "onr-callout-picker";
    Object.assign(picker.style, {
      position: "fixed",
      background: "#fff",
      border: "1px solid #c8c6c4",
      borderRadius: "4px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      padding: "4px",
      display: "flex",
      flexWrap: "wrap",
      gap: "2px",
      maxWidth: "260px",
      zIndex: "10000"
    });
    CALLOUT_TYPES.forEach((type) => {
      const btn = document.createElement("div");
      btn.textContent = type;
      Object.assign(btn.style, {
        padding: "3px 8px",
        fontSize: "11px",
        cursor: "pointer",
        borderRadius: "3px",
        border: "1px solid #e1dfdd",
        whiteSpace: "nowrap"
      });
      btn.addEventListener("mouseenter", () => btn.style.background = "#f0eeec");
      btn.addEventListener("mouseleave", () => btn.style.background = "");
      btn.addEventListener("click", () => {
        picker.remove();
        if (editor) {
          const cursor = editor.getCursor();
          editor.replaceRange(`> [!${type}]
> `, cursor);
        }
      });
      picker.appendChild(btn);
    });
    const calloutBtn = container.querySelector('[data-cmd="insert-callout"]');
    if (calloutBtn) {
      const rect = calloutBtn.getBoundingClientRect();
      picker.style.top = `${rect.bottom + 4}px`;
      picker.style.left = `${rect.left}px`;
    }
    document.body.appendChild(picker);
    const close = (e) => {
      if (!picker.contains(e.target)) {
        picker.remove();
        document.removeEventListener("click", close, true);
      }
    };
    setTimeout(() => document.addEventListener("click", close, true), 0);
  }
};

// src/ribbon/RibbonShell.ts
var TABS = [
  "Home",
  "Insert",
  "Draw",
  "History",
  "Review",
  "View",
  "Help"
];
var RibbonShell = class {
  constructor(app) {
    this.app = app;
    this.activeTab = "Home";
    this.collapsed = false;
    this.pinned = true;
  }
  mount() {
    document.getElementById("onenote-ribbon-root")?.remove();
    this.el = document.createElement("div");
    this.el.id = "onenote-ribbon-root";
    this.el.setAttribute("data-active-tab", this.activeTab);
    this.el.innerHTML = this.buildHTML();
    this.attachEvents();
    const body = this.el.querySelector(".onr-body");
    new HomeTab().render(body, this.app);
    new InsertTab().render(body, this.app);
    this.syncPanelVisibility(body);
    const hmc = document.querySelector(".horizontal-main-container");
    hmc?.parentElement?.insertBefore(this.el, hmc);
    const titlebar = document.querySelector(".titlebar");
    if (titlebar) {
      const tbHeight = titlebar.getBoundingClientRect().height;
      this.el.style.marginTop = `${tbHeight}px`;
    }
    return this.el;
  }
  unmount() {
    this.el?.remove();
  }
  syncPanelVisibility(body) {
    const container = body ?? this.el.querySelector(".onr-body");
    container.querySelectorAll(".onr-tab-panel").forEach((p) => {
      p.style.display = p.getAttribute("data-panel") === this.activeTab ? "" : "none";
    });
  }
  buildHTML() {
    const tabs = TABS.map(
      (t) => `<div class="onr-tab ${t === this.activeTab ? "active" : ""}" data-tab="${t}">${t}</div>`
    ).join("");
    return `
      <div class="onr-tab-bar">
        ${tabs}
        <div class="onr-spacer"></div>
        <div class="onr-pin-btn">${this.pinned ? "\u{1F4CC}" : ""} ${this.collapsed ? "\u25BC Expand" : "\u25B2 Collapse"}</div>
      </div>
      <div class="onr-body" data-tab-content="Home">
        <!-- tab content injected by each tab module -->
      </div>
    `;
  }
  attachEvents() {
    this.el.querySelectorAll(".onr-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.activeTab = tab.getAttribute("data-tab");
        this.el.setAttribute("data-active-tab", this.activeTab);
        this.el.querySelectorAll(".onr-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.syncPanelVisibility();
      });
    });
    this.el.querySelector(".onr-pin-btn")?.addEventListener("click", () => {
      this.collapsed = !this.collapsed;
      const body = this.el.querySelector(".onr-body");
      body.style.display = this.collapsed ? "none" : "";
      this.el.querySelector(".onr-pin-btn").textContent = this.collapsed ? "\u25BC Expand" : "\u25B2 Collapse";
    });
  }
};

// src/main.ts
var OneNoteRibbonPlugin = class extends import_obsidian3.Plugin {
  async onload() {
    this.shell = new RibbonShell(this.app);
    this.app.workspace.onLayoutReady(() => this.shell.mount());
  }
  onunload() {
    this.shell.unmount();
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3RhYnMvSG9tZVRhYi50cyIsICJzcmMvdGFicy9JbnNlcnRUYWIudHMiLCAic3JjL3JpYmJvbi9SaWJib25TaGVsbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBSaWJib25TaGVsbCB9IGZyb20gXCIuL3JpYmJvbi9SaWJib25TaGVsbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPbmVOb3RlUmliYm9uUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgcHJpdmF0ZSBzaGVsbDogUmliYm9uU2hlbGw7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2hlbGwgPSBuZXcgUmliYm9uU2hlbGwodGhpcy5hcHApO1xuICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHRoaXMuc2hlbGwubW91bnQoKSk7XG4gIH1cblxuICBvbnVubG9hZCgpIHtcbiAgICB0aGlzLnNoZWxsLnVubW91bnQoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgTm90aWNlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCBUeXBlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuaW50ZXJmYWNlIERyb3Bkb3duSXRlbSB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHN1YmxhYmVsPzogc3RyaW5nO1xuICBzdHlsZT86IHN0cmluZztcbiAgYWN0aW9uOiAoKSA9PiB2b2lkO1xuICBkaXZpZGVyPzogYm9vbGVhbjtcbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgRHJvcGRvd25PcHRzIHtcbiAgYmc/OiBzdHJpbmc7XG4gIGhvdmVyQmc/OiBzdHJpbmc7XG4gIGNvbG9yPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgVGFnRGVmIHtcbiAgbGFiZWw6IHN0cmluZztcbiAgaWNvbjogc3RyaW5nO1xuICBpY29uU3R5bGU6IHN0cmluZztcbiAgY21kOiBzdHJpbmc7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCBGdWxsIE9uZU5vdGUgdGFnIGxpc3QgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbmNvbnN0IEFMTF9UQUdTOiBUYWdEZWZbXSA9IFtcbiAge1xuICAgIGxhYmVsOiBcIlRvIERvXCIsXG4gICAgY21kOiBcInRhZy10b2RvXCIsXG4gICAgaWNvbjogXCJcdTI3MTRcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojNDQ3MkM0O2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIkltcG9ydGFudFwiLFxuICAgIGNtZDogXCJ0YWctaW1wb3J0YW50XCIsXG4gICAgaWNvbjogXCJcdTI2MDVcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojRjVBNjIzO2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlF1ZXN0aW9uXCIsXG4gICAgY21kOiBcInRhZy1xdWVzdGlvblwiLFxuICAgIGljb246IFwiP1wiLFxuICAgIGljb25TdHlsZTogXCJiYWNrZ3JvdW5kOiM3MDMwQTA7Y29sb3I6I2ZmZlwiLFxuICB9LFxuICB7XG4gICAgbGFiZWw6IFwiUmVtZW1iZXIgZm9yIGxhdGVyXCIsXG4gICAgY21kOiBcInRhZy1yZW1lbWJlclwiLFxuICAgIGljb246IFwiXHVEODNEXHVERDE0XCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6I0VEN0QzMTtjb2xvcjojZmZmXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJEZWZpbml0aW9uXCIsXG4gICAgY21kOiBcInRhZy1kZWZpbml0aW9uXCIsXG4gICAgaWNvbjogXCJcdUQ4M0RcdURDRDZcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojNzBBRDQ3O2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIkhpZ2hsaWdodFwiLFxuICAgIGNtZDogXCJ0YWctaGlnaGxpZ2h0XCIsXG4gICAgaWNvbjogXCJcdTI3MEZcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojRkZGRjAwO2NvbG9yOiMzMzM7Ym9yZGVyOjFweCBzb2xpZCAjY2NjXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJDb250YWN0XCIsXG4gICAgY21kOiBcInRhZy1jb250YWN0XCIsXG4gICAgaWNvbjogXCJcdUQ4M0RcdURDNjRcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojNUI5QkQ1O2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIkFkZHJlc3NcIixcbiAgICBjbWQ6IFwidGFnLWFkZHJlc3NcIixcbiAgICBpY29uOiBcIlx1RDgzQ1x1REZFMFwiLFxuICAgIGljb25TdHlsZTogXCJiYWNrZ3JvdW5kOiM1QjlCRDU7Y29sb3I6I2ZmZlwiLFxuICB9LFxuICB7XG4gICAgbGFiZWw6IFwiUGhvbmUgbnVtYmVyXCIsXG4gICAgY21kOiBcInRhZy1waG9uZVwiLFxuICAgIGljb246IFwiXHVEODNEXHVEQ0RFXCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6IzVCOUJENTtjb2xvcjojZmZmXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJXZWIgc2l0ZSB0byB2aXNpdFwiLFxuICAgIGNtZDogXCJ0YWctd2Vic2l0ZVwiLFxuICAgIGljb246IFwiXHVEODNDXHVERjEwXCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6IzVCOUJENTtjb2xvcjojZmZmXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJJZGVhXCIsXG4gICAgY21kOiBcInRhZy1pZGVhXCIsXG4gICAgaWNvbjogXCJcdUQ4M0RcdURDQTFcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojRkZENzAwO2NvbG9yOiMzMzNcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlBhc3N3b3JkXCIsXG4gICAgY21kOiBcInRhZy1wYXNzd29yZFwiLFxuICAgIGljb246IFwiXHVEODNEXHVERDExXCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6IzgwODA4MDtjb2xvcjojZmZmXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJDcml0aWNhbFwiLFxuICAgIGNtZDogXCJ0YWctY3JpdGljYWxcIixcbiAgICBpY29uOiBcIiFcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojRkYwMDAwO2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlByb2plY3QgQVwiLFxuICAgIGNtZDogXCJ0YWctcHJvamVjdC1hXCIsXG4gICAgaWNvbjogXCIgXCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6I0ZGNkI2QlwiLFxuICB9LFxuICB7XG4gICAgbGFiZWw6IFwiUHJvamVjdCBCXCIsXG4gICAgY21kOiBcInRhZy1wcm9qZWN0LWJcIixcbiAgICBpY29uOiBcIiBcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojRkZENzAwXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJNb3ZpZSB0byBzZWVcIixcbiAgICBjbWQ6IFwidGFnLW1vdmllXCIsXG4gICAgaWNvbjogXCJcdUQ4M0NcdURGQUNcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojMzMzO2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIkJvb2sgdG8gcmVhZFwiLFxuICAgIGNtZDogXCJ0YWctYm9va1wiLFxuICAgIGljb246IFwiXHVEODNEXHVEQ0RBXCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6IzVCOUJENTtjb2xvcjojZmZmXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJNdXNpYyB0byBsaXN0ZW4gdG9cIixcbiAgICBjbWQ6IFwidGFnLW11c2ljXCIsXG4gICAgaWNvbjogXCJcdTI2NkFcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojNUI5QkQ1O2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlNvdXJjZSBmb3IgYXJ0aWNsZVwiLFxuICAgIGNtZDogXCJ0YWctc291cmNlXCIsXG4gICAgaWNvbjogXCJcdUQ4M0RcdUREMERcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojODA4MDgwO2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlJlbWVtYmVyIGZvciBibG9nXCIsXG4gICAgY21kOiBcInRhZy1ibG9nXCIsXG4gICAgaWNvbjogXCJcdUQ4M0RcdURDRERcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojMzMzO2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIkRpc2N1c3Mgd2l0aCBBXCIsXG4gICAgY21kOiBcInRhZy1kaXNjdXNzLWFcIixcbiAgICBpY29uOiBcIlx1RDgzRFx1RENBQ1wiLFxuICAgIGljb25TdHlsZTogXCJiYWNrZ3JvdW5kOiM1QjlCRDU7Y29sb3I6I2ZmZlwiLFxuICB9LFxuICB7XG4gICAgbGFiZWw6IFwiRGlzY3VzcyB3aXRoIEJcIixcbiAgICBjbWQ6IFwidGFnLWRpc2N1c3MtYlwiLFxuICAgIGljb246IFwiXHVEODNEXHVEQ0FDXCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6IzVCOUJENTtjb2xvcjojZmZmXCIsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJEaXNjdXNzIHcvIG1hbmFnZXJcIixcbiAgICBjbWQ6IFwidGFnLWRpc2N1c3MtbWdyXCIsXG4gICAgaWNvbjogXCJcdUQ4M0RcdURDQUNcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojNUI5QkQ1O2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlNlbmQgaW4gZW1haWxcIixcbiAgICBjbWQ6IFwidGFnLWVtYWlsXCIsXG4gICAgaWNvbjogXCJcdTI3MDlcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojNUI5QkQ1O2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlNjaGVkdWxlIG1lZXRpbmdcIixcbiAgICBjbWQ6IFwidGFnLW1lZXRpbmdcIixcbiAgICBpY29uOiBcIlx1RDgzRFx1RENDNVwiLFxuICAgIGljb25TdHlsZTogXCJiYWNrZ3JvdW5kOiM0NDcyQzQ7Y29sb3I6I2ZmZlwiLFxuICB9LFxuICB7XG4gICAgbGFiZWw6IFwiQ2FsbCBiYWNrXCIsXG4gICAgY21kOiBcInRhZy1jYWxsXCIsXG4gICAgaWNvbjogXCJcdUQ4M0RcdURDREVcIixcbiAgICBpY29uU3R5bGU6IFwiYmFja2dyb3VuZDojNzBBRDQ3O2NvbG9yOiNmZmZcIixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiBcIlRvIERvIHByaW9yaXR5IDFcIixcbiAgICBjbWQ6IFwidGFnLXRvZG8tcDFcIixcbiAgICBpY29uOiBcIlx1MjcxNFwiLFxuICAgIGljb25TdHlsZTogXCJiYWNrZ3JvdW5kOiM0NDcyQzQ7Y29sb3I6I2ZmZlwiLFxuICB9LFxuICB7XG4gICAgbGFiZWw6IFwiVG8gRG8gcHJpb3JpdHkgMlwiLFxuICAgIGNtZDogXCJ0YWctdG9kby1wMlwiLFxuICAgIGljb246IFwiXHUyNzE0XCIsXG4gICAgaWNvblN0eWxlOiBcImJhY2tncm91bmQ6IzQ0NzJDNDtjb2xvcjojZmZmXCIsXG4gIH0sXG5dO1xuXG5jb25zdCBUQUdfQ01EX1RPX0RFRjogUmVjb3JkPHN0cmluZywgVGFnRGVmPiA9IHt9O1xuZm9yIChjb25zdCB0IG9mIEFMTF9UQUdTKSBUQUdfQ01EX1RPX0RFRlt0LmNtZF0gPSB0O1xuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgU3R5bGVzIGxpc3QgZm9yIHRoZSBwcmV2aWV3IHBhbmVsIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5pbnRlcmZhY2UgU3R5bGVEZWYge1xuICBsYWJlbDogc3RyaW5nO1xuICBzdHlsZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgc3VmZml4Pzogc3RyaW5nO1xufVxuXG5jb25zdCBTVFlMRVNfTElTVDogU3R5bGVEZWZbXSA9IFtcbiAgeyBsYWJlbDogXCJIZWFkaW5nIDFcIiwgc3R5bGU6IFwiZm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiM1QjlCRDU7bGV0dGVyLXNwYWNpbmc6LTAuNXB4XCIsIHByZWZpeDogXCIjIFwiIH0sXG4gIHsgbGFiZWw6IFwiSGVhZGluZyAyXCIsIHN0eWxlOiBcImZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojNUI5QkQ1XCIsIHByZWZpeDogXCIjIyBcIiB9LFxuICB7IGxhYmVsOiBcIkhlYWRpbmcgM1wiLCBzdHlsZTogXCJmb250LXNpemU6MTJweDtmb250LXdlaWdodDo3MDA7Y29sb3I6IzVCOUJENVwiLCBwcmVmaXg6IFwiIyMjIFwiIH0sXG4gIHsgbGFiZWw6IFwiSGVhZGluZyA0XCIsIHN0eWxlOiBcImZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjcwMDtmb250LXN0eWxlOml0YWxpYztjb2xvcjojNUI5QkQ1XCIsIHByZWZpeDogXCIjIyMjIFwiIH0sXG4gIHsgbGFiZWw6IFwiSGVhZGluZyA1XCIsIHN0eWxlOiBcImZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojNUI5QkQ1XCIsIHByZWZpeDogXCIjIyMjIyBcIiB9LFxuICB7IGxhYmVsOiBcIkhlYWRpbmcgNlwiLCBzdHlsZTogXCJmb250LXNpemU6MTFweDtmb250LXN0eWxlOml0YWxpYztjb2xvcjojNUI5QkQ1XCIsIHByZWZpeDogXCIjIyMjIyMgXCIgfSxcbiAgeyBsYWJlbDogXCJQYWdlIFRpdGxlXCIsIHN0eWxlOiBcImZvbnQtc2l6ZToyMHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojZmZmXCIsIHByZWZpeDogXCIjIFwiIH0sXG4gIHsgbGFiZWw6IFwiQ2l0YXRpb25cIiwgc3R5bGU6IFwiZm9udC1zaXplOjExcHg7Y29sb3I6Izg4ODtmb250LXN0eWxlOml0YWxpY1wiLCBwcmVmaXg6IFwiPiBcIiB9LFxuICB7IGxhYmVsOiBcIlF1b3RlXCIsIHN0eWxlOiBcImZvbnQtc2l6ZToxMnB4O2ZvbnQtc3R5bGU6aXRhbGljO2NvbG9yOiNjY2NcIiwgcHJlZml4OiBcIj4gXCIgfSxcbiAgeyBsYWJlbDogXCJDb2RlXCIsIHN0eWxlOiBcImZvbnQtZmFtaWx5Om1vbm9zcGFjZTtmb250LXNpemU6MTFweDtiYWNrZ3JvdW5kOiMyMjI7cGFkZGluZzowIDRweDtjb2xvcjojZTBlMGUwXCIsIHByZWZpeDogXCJgYGBcXG5cIiwgc3VmZml4OiBcIlxcbmBgYFwiIH0sXG4gIHsgbGFiZWw6IFwiTm9ybWFsXCIsIHN0eWxlOiBcImZvbnQtc2l6ZToxMnB4O2NvbG9yOiNlMGUwZTBcIiwgcHJlZml4OiBcIlwiIH0sXG5dO1xuXG4vLyBNYXAgdGFnIGNtZCBcdTIxOTIgTWFya2Rvd24gbm90YXRpb24gdG8gaW5zZXJ0L3RvZ2dsZVxuZnVuY3Rpb24gdGFnTm90YXRpb24oY21kOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgXCJ0YWctdG9kb1wiOiBcIi0gWyBdIFwiLFxuICAgIFwidGFnLXRvZG8tcDFcIjogXCItIFsgXSBcdUQ4M0RcdUREMzQgXCIsXG4gICAgXCJ0YWctdG9kby1wMlwiOiBcIi0gWyBdIFx1RDgzRFx1REZFMSBcIixcbiAgICBcInRhZy1pbXBvcnRhbnRcIjogXCI+IFshaW1wb3J0YW50XVxcbj4gXCIsXG4gICAgXCJ0YWctcXVlc3Rpb25cIjogXCI+IFshcXVlc3Rpb25dXFxuPiBcIixcbiAgICBcInRhZy1yZW1lbWJlclwiOiBcIj4gWyFub3RlXSBSZW1lbWJlciBmb3IgbGF0ZXJcXG4+IFwiLFxuICAgIFwidGFnLWRlZmluaXRpb25cIjogXCI+IFshaW5mb10gRGVmaW5pdGlvblxcbj4gXCIsXG4gICAgXCJ0YWctaGlnaGxpZ2h0XCI6IFwiPT1cIixcbiAgICBcInRhZy1jb250YWN0XCI6IFwiPiBbIXRpcF0gQ29udGFjdFxcbj4gXCIsXG4gICAgXCJ0YWctYWRkcmVzc1wiOiBcIj4gWyFhYnN0cmFjdF0gQWRkcmVzc1xcbj4gXCIsXG4gICAgXCJ0YWctcGhvbmVcIjogXCI+IFshZXhhbXBsZV0gUGhvbmVcXG4+IFwiLFxuICAgIFwidGFnLXdlYnNpdGVcIjogXCI+IFshdG9kb10gV2Vic2l0ZVxcbj4gXCIsXG4gICAgXCJ0YWctaWRlYVwiOiBcIj4gWyF0aXBdIFx1RDgzRFx1RENBMSBJZGVhXFxuPiBcIixcbiAgICBcInRhZy1wYXNzd29yZFwiOiBcIj4gWyF3YXJuaW5nXSBQYXNzd29yZFxcbj4gXCIsXG4gICAgXCJ0YWctY3JpdGljYWxcIjogXCI+IFshZGFuZ2VyXSBDcml0aWNhbFxcbj4gXCIsXG4gICAgXCJ0YWctcHJvamVjdC1hXCI6IFwiPiBbIWZhaWx1cmVdIFByb2plY3QgQVxcbj4gXCIsXG4gICAgXCJ0YWctcHJvamVjdC1iXCI6IFwiPiBbIWJ1Z10gUHJvamVjdCBCXFxuPiBcIixcbiAgICBcInRhZy1tb3ZpZVwiOiBcIj4gWyFub3RlXSBcdUQ4M0NcdURGQUMgTW92aWUgdG8gc2VlXFxuPiBcIixcbiAgICBcInRhZy1ib29rXCI6IFwiPiBbIW5vdGVdIFx1RDgzRFx1RENEQSBCb29rIHRvIHJlYWRcXG4+IFwiLFxuICAgIFwidGFnLW11c2ljXCI6IFwiPiBbIW5vdGVdIFx1MjY2QSBNdXNpY1xcbj4gXCIsXG4gICAgXCJ0YWctc291cmNlXCI6IFwiPiBbIW5vdGVdIFNvdXJjZVxcbj4gXCIsXG4gICAgXCJ0YWctYmxvZ1wiOiBcIj4gWyFub3RlXSBCbG9nXFxuPiBcIixcbiAgICBcInRhZy1kaXNjdXNzLWFcIjogXCI+IFshdGlwXSBEaXNjdXNzIHdpdGggQVxcbj4gXCIsXG4gICAgXCJ0YWctZGlzY3Vzcy1iXCI6IFwiPiBbIXRpcF0gRGlzY3VzcyB3aXRoIEJcXG4+IFwiLFxuICAgIFwidGFnLWRpc2N1c3MtbWdyXCI6IFwiPiBbIXRpcF0gRGlzY3VzcyB3aXRoIG1hbmFnZXJcXG4+IFwiLFxuICAgIFwidGFnLWVtYWlsXCI6IFwiPiBbIXRvZG9dIFNlbmQgaW4gZW1haWxcXG4+IFwiLFxuICAgIFwidGFnLW1lZXRpbmdcIjogXCI+IFshdG9kb10gU2NoZWR1bGUgbWVldGluZ1xcbj4gXCIsXG4gICAgXCJ0YWctY2FsbFwiOiBcIj4gWyF0b2RvXSBDYWxsIGJhY2tcXG4+IFwiLFxuICB9O1xuICByZXR1cm4gbWFwW2NtZF0gPz8gXCJcIjtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIE92ZXJsYXkgZHJvcGRvd24gaGVscGVyIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBzaG93RHJvcGRvd24oYW5jaG9yOiBIVE1MRWxlbWVudCwgaXRlbXM6IERyb3Bkb3duSXRlbVtdLCBvcHRzPzogRHJvcGRvd25PcHRzKTogdm9pZCB7XG4gIC8vIFJlbW92ZSBhbnkgZXhpc3RpbmcgZHJvcGRvd25cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbChcIi5vbnItb3ZlcmxheS1kcm9wZG93blwiKVxuICAgIC5mb3JFYWNoKChlbCkgPT4gZWwucmVtb3ZlKCkpO1xuXG4gIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBtZW51LmNsYXNzTmFtZSA9IFwib25yLW92ZXJsYXktZHJvcGRvd25cIjtcblxuICBjb25zdCBtZW51QmcgPSBvcHRzPy5iZyA/PyBcIiNmZmZcIjtcbiAgY29uc3QgaG92ZXJCZyA9IG9wdHM/LmhvdmVyQmcgPz8gXCIjZjBlZWVjXCI7XG4gIGNvbnN0IHRleHRDb2xvciA9IG9wdHM/LmNvbG9yID8/IFwiIzIwMWYxZVwiO1xuXG4gIC8vIERldGVybWluZSBzY3JvbGxpbmcgXHUyMDE0IGxhcmdlIG1lbnVzIGdldCBtYXgtaGVpZ2h0ICsgc2Nyb2xsXG4gIGNvbnN0IG5lZWRzU2Nyb2xsID0gaXRlbXMubGVuZ3RoID4gMTU7XG4gIE9iamVjdC5hc3NpZ24obWVudS5zdHlsZSwge1xuICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgYmFja2dyb3VuZDogbWVudUJnLFxuICAgIGJvcmRlcjogXCIxcHggc29saWQgI2M4YzZjNFwiLFxuICAgIGJvcmRlclJhZGl1czogXCIycHhcIixcbiAgICBib3hTaGFkb3c6IFwiMCA0cHggMTZweCByZ2JhKDAsMCwwLDAuMTgpXCIsXG4gICAgekluZGV4OiBcIjk5OTk5XCIsXG4gICAgbWluV2lkdGg6IFwiMTYwcHhcIixcbiAgICBwYWRkaW5nOiBcIjJweCAwXCIsXG4gICAgZm9udEZhbWlseTogXCInU2Vnb2UgVUknLCBzeXN0ZW0tdWksIHNhbnMtc2VyaWZcIixcbiAgICBmb250U2l6ZTogXCIxMnB4XCIsXG4gICAgLi4uKG5lZWRzU2Nyb2xsID8geyBtYXhIZWlnaHQ6IFwiMzQwcHhcIiwgb3ZlcmZsb3dZOiBcImF1dG9cIiB9IDoge30pLFxuICB9KTtcblxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBpZiAoaXRlbS5kaXZpZGVyKSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgT2JqZWN0LmFzc2lnbihkaXYuc3R5bGUsIHtcbiAgICAgICAgYm9yZGVyVG9wOiBcIjFweCBzb2xpZCAjZTFkZmRkXCIsXG4gICAgICAgIG1hcmdpbjogXCIycHggMFwiLFxuICAgICAgfSk7XG4gICAgICBtZW51LmFwcGVuZENoaWxkKGRpdik7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICByb3cuY2xhc3NOYW1lID0gXCJvbnItZGQtaXRlbVwiO1xuICAgIE9iamVjdC5hc3NpZ24ocm93LnN0eWxlLCB7XG4gICAgICBwYWRkaW5nOiBcIjVweCAxMnB4XCIsXG4gICAgICBjdXJzb3I6IGl0ZW0uZGlzYWJsZWQgPyBcImRlZmF1bHRcIiA6IFwicG9pbnRlclwiLFxuICAgICAgY29sb3I6IGl0ZW0uZGlzYWJsZWQgPyBcIiNhMTlmOWRcIiA6IHRleHRDb2xvcixcbiAgICAgIGRpc3BsYXk6IFwiZmxleFwiLFxuICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgIGdhcDogXCI2cHhcIixcbiAgICAgIHdoaXRlU3BhY2U6IFwibm93cmFwXCIsXG4gICAgfSk7XG4gICAgaWYgKGl0ZW0uc3R5bGUpXG4gICAgICByb3cuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgcm93LmdldEF0dHJpYnV0ZShcInN0eWxlXCIpICsgXCI7XCIgKyBpdGVtLnN0eWxlKTtcbiAgICByb3cudGV4dENvbnRlbnQgPSBpdGVtLmxhYmVsO1xuICAgIGlmIChpdGVtLnN1YmxhYmVsKSB7XG4gICAgICBjb25zdCBzdWIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgIHN1Yi50ZXh0Q29udGVudCA9IGl0ZW0uc3VibGFiZWw7XG4gICAgICBzdWIuc3R5bGUuY3NzVGV4dCA9XG4gICAgICAgIFwiZm9udC1zaXplOjEwcHg7Y29sb3I6IzYwNWU1YzttYXJnaW4tbGVmdDphdXRvO3BhZGRpbmctbGVmdDoxNnB4XCI7XG4gICAgICByb3cuYXBwZW5kQ2hpbGQoc3ViKTtcbiAgICB9XG4gICAgaWYgKCFpdGVtLmRpc2FibGVkKSB7XG4gICAgICByb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgICAgICByb3cuc3R5bGUuYmFja2dyb3VuZCA9IGhvdmVyQmc7XG4gICAgICB9KTtcbiAgICAgIHJvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgICAgIHJvdy5zdHlsZS5iYWNrZ3JvdW5kID0gXCJcIjtcbiAgICAgIH0pO1xuICAgICAgcm93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSk7XG4gICAgICByb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG1lbnUucmVtb3ZlKCk7XG4gICAgICAgIGl0ZW0uYWN0aW9uKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgbWVudS5hcHBlbmRDaGlsZChyb3cpO1xuICB9XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcblxuICAvLyBQb3NpdGlvbiBiZWxvdyBhbmNob3JcbiAgY29uc3QgcmVjdCA9IGFuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgbGV0IHRvcCA9IHJlY3QuYm90dG9tICsgMjtcbiAgbGV0IGxlZnQgPSByZWN0LmxlZnQ7XG5cbiAgLy8gQ2xhbXAgd2l0aGluIHZpZXdwb3J0XG4gIGNvbnN0IG1oID0gbmVlZHNTY3JvbGwgPyAzNDAgOiBtZW51LnNjcm9sbEhlaWdodCB8fCAyMDA7XG4gIGlmICh0b3AgKyBtaCA+IHdpbmRvdy5pbm5lckhlaWdodCkgdG9wID0gcmVjdC50b3AgLSBtaCAtIDI7XG4gIGlmIChsZWZ0ICsgMjAwID4gd2luZG93LmlubmVyV2lkdGgpIGxlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDIwNDtcblxuICBtZW51LnN0eWxlLnRvcCA9IHRvcCArIFwicHhcIjtcbiAgbWVudS5zdHlsZS5sZWZ0ID0gbGVmdCArIFwicHhcIjtcblxuICAvLyBDbG9zZSBvbiBvdXRzaWRlIGNsaWNrXG4gIGNvbnN0IGNsb3NlID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICBpZiAoIW1lbnUuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSkpIHtcbiAgICAgIG1lbnUucmVtb3ZlKCk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2UsIHRydWUpO1xuICAgIH1cbiAgfTtcbiAgc2V0VGltZW91dCgoKSA9PiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2UsIHRydWUpLCAwKTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIFRhZ3MgZHJvcGRvd24gd2l0aCBmdWxsIHNjcm9sbGFibGUgbGlzdCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuZnVuY3Rpb24gc2hvd1RhZ3NEcm9wZG93bihhbmNob3I6IEhUTUxFbGVtZW50LCBhcHA6IEFwcCk6IHZvaWQge1xuICBjb25zdCBlZGl0b3IgPSBhcHAud29ya3NwYWNlLmFjdGl2ZUVkaXRvcj8uZWRpdG9yO1xuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIub25yLW92ZXJsYXktZHJvcGRvd25cIilcbiAgICAuZm9yRWFjaCgoZWwpID0+IGVsLnJlbW92ZSgpKTtcbiAgY29uc3QgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1lbnUuY2xhc3NOYW1lID0gXCJvbnItb3ZlcmxheS1kcm9wZG93blwiO1xuICBPYmplY3QuYXNzaWduKG1lbnUuc3R5bGUsIHtcbiAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgIGJhY2tncm91bmQ6IFwiIzFhMWExYVwiLFxuICAgIGJvcmRlcjogXCIxcHggc29saWQgIzU1NVwiLFxuICAgIGJvcmRlclJhZGl1czogXCIycHhcIixcbiAgICBib3hTaGFkb3c6IFwiMCA0cHggMTZweCByZ2JhKDAsMCwwLDAuNSlcIixcbiAgICB6SW5kZXg6IFwiOTk5OTlcIixcbiAgICBtaW5XaWR0aDogXCIyMjBweFwiLFxuICAgIHBhZGRpbmc6IFwiMnB4IDBcIixcbiAgICBmb250RmFtaWx5OiBcIidTZWdvZSBVSScsIHN5c3RlbS11aSwgc2Fucy1zZXJpZlwiLFxuICAgIGZvbnRTaXplOiBcIjEycHhcIixcbiAgICBtYXhIZWlnaHQ6IFwiNDIwcHhcIixcbiAgICBvdmVyZmxvd1k6IFwiYXV0b1wiLFxuICB9KTtcblxuICBmb3IgKGNvbnN0IHRhZyBvZiBBTExfVEFHUykge1xuICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcm93LmNsYXNzTmFtZSA9IFwib25yLWRkLWl0ZW1cIjtcbiAgICBPYmplY3QuYXNzaWduKHJvdy5zdHlsZSwge1xuICAgICAgcGFkZGluZzogXCI0cHggOHB4XCIsXG4gICAgICBjdXJzb3I6IFwicG9pbnRlclwiLFxuICAgICAgY29sb3I6IFwiI2UwZTBlMFwiLFxuICAgICAgZGlzcGxheTogXCJmbGV4XCIsXG4gICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgZ2FwOiBcIjZweFwiLFxuICAgIH0pO1xuXG4gICAgY29uc3QgaWNvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgaWNvbkVsLnRleHRDb250ZW50ID0gdGFnLmljb247XG4gICAgaWNvbkVsLnN0eWxlLmNzc1RleHQgPSBgZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxNnB4O2hlaWdodDoxNnB4O2JvcmRlci1yYWRpdXM6MnB4O2ZvbnQtc2l6ZToxMHB4O2ZsZXgtc2hyaW5rOjA7JHt0YWcuaWNvblN0eWxlfWA7XG5cbiAgICBjb25zdCBsYWJlbEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgbGFiZWxFbC50ZXh0Q29udGVudCA9IHRhZy5sYWJlbDtcbiAgICBsYWJlbEVsLnN0eWxlLmNzc1RleHQgPSBcImZsZXg6MTtmb250LXNpemU6MTFweFwiO1xuXG4gICAgLy8gQ2hlY2tib3ggc3dhdGNoICh2aXN1YWwgc3RhdGUpXG4gICAgY29uc3QgY2hlY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNoZWNrLnN0eWxlLmNzc1RleHQgPVxuICAgICAgXCJ3aWR0aDoxNnB4O2hlaWdodDoxNnB4O2JvcmRlcjoxcHggc29saWQgIzY2NjtiYWNrZ3JvdW5kOiMzMzM7ZmxleC1zaHJpbms6MDtib3JkZXItcmFkaXVzOjFweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXJcIjtcblxuICAgIC8vIENoZWNrIGlmIGN1cnJlbnQgbGluZSBoYXMgdGhpcyB0YWcgYWN0aXZlXG4gICAgaWYgKGVkaXRvcikge1xuICAgICAgY29uc3QgbGluZVRleHQgPSBlZGl0b3IuZ2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSk7XG4gICAgICBjb25zdCBub3RhdGlvbiA9IHRhZ05vdGF0aW9uKHRhZy5jbWQpO1xuICAgICAgaWYgKG5vdGF0aW9uICYmIGxpbmVUZXh0LmluY2x1ZGVzKG5vdGF0aW9uLnNwbGl0KFwiXFxuXCIpWzBdLnRyaW0oKSkpIHtcbiAgICAgICAgY2hlY2suc3R5bGUuYmFja2dyb3VuZCA9IFwiIzQ0NzJDNFwiO1xuICAgICAgICBjaGVjay5pbm5lckhUTUwgPVxuICAgICAgICAgICc8c3ZnIHZpZXdCb3g9XCIwIDAgMTIgMTJcIiBzdHlsZT1cIndpZHRoOjEwcHg7aGVpZ2h0OjEwcHhcIj48cG9seWxpbmUgcG9pbnRzPVwiMiw2IDUsOSAxMCwzXCIgc3Ryb2tlPVwid2hpdGVcIiBzdHJva2Utd2lkdGg9XCIyXCIgZmlsbD1cIm5vbmVcIi8+PC9zdmc+JztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByb3cuYXBwZW5kQ2hpbGQoaWNvbkVsKTtcbiAgICByb3cuYXBwZW5kQ2hpbGQobGFiZWxFbCk7XG4gICAgcm93LmFwcGVuZENoaWxkKGNoZWNrKTtcblxuICAgIHJvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgICByb3cuc3R5bGUuYmFja2dyb3VuZCA9IFwiIzJhMmEzZVwiO1xuICAgIH0pO1xuICAgIHJvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgICByb3cuc3R5bGUuYmFja2dyb3VuZCA9IFwiXCI7XG4gICAgfSk7XG4gICAgcm93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcbiAgICByb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgbWVudS5yZW1vdmUoKTtcbiAgICAgIGlmIChlZGl0b3IpIGFwcGx5VGFnKHRhZy5jbWQsIGVkaXRvcik7XG4gICAgfSk7XG5cbiAgICBtZW51LmFwcGVuZENoaWxkKHJvdyk7XG4gIH1cblxuICAvLyBEaXZpZGVyICsgQ3VzdG9taXplIFRhZ3NcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgZGl2LnN0eWxlLmNzc1RleHQgPSBcImJvcmRlci10b3A6MXB4IHNvbGlkICM1NTU7bWFyZ2luOjJweCAwXCI7XG4gIG1lbnUuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICBjb25zdCBjdXN0b21Sb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjdXN0b21Sb3cuc3R5bGUuY3NzVGV4dCA9XG4gICAgXCJwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Y29sb3I6Izg4ODtmb250LXNpemU6MTFweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHhcIjtcbiAgY3VzdG9tUm93LmlubmVySFRNTCA9XG4gICAgJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjEzcHhcIj5cdUQ4M0RcdUREMjc8L3NwYW4+IEN1c3RvbWl6ZSBUYWdzLi4uJztcbiAgY3VzdG9tUm93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgbWVudS5yZW1vdmUoKTtcbiAgICBuZXcgTm90aWNlKFwiQ3VzdG9taXplIFRhZ3MgaXMgbm90IHlldCBpbXBsZW1lbnRlZFwiKTtcbiAgfSk7XG4gIG1lbnUuYXBwZW5kQ2hpbGQoY3VzdG9tUm93KTtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1lbnUpO1xuXG4gIGNvbnN0IHJlY3QgPSBhbmNob3IuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGxldCB0b3AgPSByZWN0LmJvdHRvbSArIDI7XG4gIGxldCBsZWZ0ID0gcmVjdC5sZWZ0O1xuICBpZiAodG9wICsgNDIwID4gd2luZG93LmlubmVySGVpZ2h0KVxuICAgIHRvcCA9IE1hdGgubWF4KDQsIHdpbmRvdy5pbm5lckhlaWdodCAtIDQyNCk7XG4gIGlmIChsZWZ0ICsgMjI0ID4gd2luZG93LmlubmVyV2lkdGgpIGxlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDIyODtcbiAgbWVudS5zdHlsZS50b3AgPSB0b3AgKyBcInB4XCI7XG4gIG1lbnUuc3R5bGUubGVmdCA9IGxlZnQgKyBcInB4XCI7XG5cbiAgY29uc3QgY2xvc2UgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGlmICghbWVudS5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgbWVudS5yZW1vdmUoKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSwgdHJ1ZSk7XG4gICAgfVxuICB9O1xuICBzZXRUaW1lb3V0KCgpID0+IGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSwgdHJ1ZSksIDApO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgVGFnIGFwcGx5ICh0b2dnbGUpIGxvZ2ljIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBhcHBseVRhZyhjbWQ6IHN0cmluZywgZWRpdG9yOiBhbnkpOiB2b2lkIHtcbiAgY29uc3Qgbm90YXRpb24gPSB0YWdOb3RhdGlvbihjbWQpO1xuICBpZiAoIW5vdGF0aW9uKSByZXR1cm47XG5cbiAgaWYgKGNtZCA9PT0gXCJ0YWctaGlnaGxpZ2h0XCIpIHtcbiAgICB0b2dnbGVJbmxpbmUoZWRpdG9yLCBcIj09XCIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRMaW5lKGN1cnNvci5saW5lKTtcbiAgY29uc3QgZmlyc3RQYXJ0ID0gbm90YXRpb24uc3BsaXQoXCJcXG5cIilbMF07XG5cbiAgaWYgKGxpbmUuc3RhcnRzV2l0aChmaXJzdFBhcnQpKSB7XG4gICAgLy8gVG9nZ2xlIE9GRlxuICAgIGNvbnN0IG5vdGF0aW9uTGluZXMgPSBub3RhdGlvbi5zcGxpdChcIlxcblwiKTtcbiAgICBpZiAobm90YXRpb25MaW5lcy5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBNdWx0aWxpbmUgY2FsbG91dCBcdTIwMTQgZGVsZXRlIGhlYWRlciBsaW5lIGFuZCBzdHJpcCBjb250aW51YXRpb24gcHJlZml4IGZyb20gbmV4dCBsaW5lXG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgICAgICBcIlwiLFxuICAgICAgICB7IGxpbmU6IGN1cnNvci5saW5lLCBjaDogMCB9LFxuICAgICAgICB7IGxpbmU6IGN1cnNvci5saW5lICsgMSwgY2g6IDAgfSxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb250UHJlZml4ID0gbm90YXRpb25MaW5lc1sxXTsgLy8gZS5nLiBcIj4gXCJcbiAgICAgIGlmIChjb250UHJlZml4KSB7XG4gICAgICAgIGNvbnN0IG5ld0xpbmUgPSBlZGl0b3IuZ2V0TGluZShjdXJzb3IubGluZSk7XG4gICAgICAgIGlmIChuZXdMaW5lICE9PSB1bmRlZmluZWQgJiYgbmV3TGluZS5zdGFydHNXaXRoKGNvbnRQcmVmaXgpKSB7XG4gICAgICAgICAgZWRpdG9yLnNldExpbmUoY3Vyc29yLmxpbmUsIG5ld0xpbmUuc2xpY2UoY29udFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlZGl0b3Iuc2V0TGluZShjdXJzb3IubGluZSwgbGluZS5zbGljZShmaXJzdFBhcnQubGVuZ3RoKSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKFxuICAgIGNtZCA9PT0gXCJ0YWctdG9kb1wiIHx8XG4gICAgY21kID09PSBcInRhZy10b2RvLXAxXCIgfHxcbiAgICBjbWQgPT09IFwidGFnLXRvZG8tcDJcIlxuICApIHtcbiAgICB0b2dnbGVMaW5lUHJlZml4KGVkaXRvciwgZmlyc3RQYXJ0KTtcbiAgfSBlbHNlIHtcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKG5vdGF0aW9uLCBjdXJzb3IpO1xuICB9XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCBJbmxpbmUgdG9nZ2xlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiB0b2dnbGVJbmxpbmUoZWRpdG9yOiBhbnksIG9wZW46IHN0cmluZywgY2xvc2U/OiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgY2wgPSBjbG9zZSA/PyBvcGVuO1xuICBjb25zdCBzZWwgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gIGlmIChzZWwpIHtcbiAgICBpZiAoc2VsLnN0YXJ0c1dpdGgob3BlbikgJiYgc2VsLmVuZHNXaXRoKGNsKSkge1xuICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oc2VsLnNsaWNlKG9wZW4ubGVuZ3RoLCBzZWwubGVuZ3RoIC0gY2wubGVuZ3RoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGAke29wZW59JHtzZWx9JHtjbH1gKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoYCR7b3Blbn0ke2NsfWAsIGN1cnNvcik7XG4gICAgZWRpdG9yLnNldEN1cnNvcih7IGxpbmU6IGN1cnNvci5saW5lLCBjaDogY3Vyc29yLmNoICsgb3Blbi5sZW5ndGggfSk7XG4gIH1cbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIExpbmUgcHJlZml4IHRvZ2dsZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuZnVuY3Rpb24gdG9nZ2xlTGluZVByZWZpeChlZGl0b3I6IGFueSwgcHJlZml4OiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICBjb25zdCBsaW5lID0gZWRpdG9yLmdldExpbmUoY3Vyc29yLmxpbmUpO1xuXG4gIC8vIEZvciB0b2RvLXN0eWxlIHByZWZpeGVzLCBhbHNvIHRyZWF0IGNvbXBsZXRlZCB2YXJpYW50cyAoLSBbeF0gLyAtIFtYXSAvIC0gW1x1MjcxNF0gKSBhcyBcImhhcyBwcmVmaXhcIlxuICBsZXQgaGFzUHJlZml4ID0gbGluZS5zdGFydHNXaXRoKHByZWZpeCk7XG4gIGxldCBhY3R1YWxQcmVmaXhMZW5ndGggPSBwcmVmaXgubGVuZ3RoO1xuICBpZiAoIWhhc1ByZWZpeCAmJiBwcmVmaXguc3RhcnRzV2l0aChcIi0gWyBdIFwiKSkge1xuICAgIGNvbnN0IHJlc3QgPSBwcmVmaXguc2xpY2UoXCItIFsgXSBcIi5sZW5ndGgpOyAvLyBlLmcuIFwiXCIgb3IgXCJcdUQ4M0RcdUREMzQgXCIgb3IgXCJcdUQ4M0RcdURGRTEgXCJcbiAgICBmb3IgKGNvbnN0IHYgb2YgW1wiLSBbeF0gXCIsIFwiLSBbWF0gXCIsIFwiLSBbXHUyNzE0XSBcIl0pIHtcbiAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgodiArIHJlc3QpKSB7XG4gICAgICAgIGhhc1ByZWZpeCA9IHRydWU7XG4gICAgICAgIGFjdHVhbFByZWZpeExlbmd0aCA9ICh2ICsgcmVzdCkubGVuZ3RoO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaGFzUHJlZml4KSB7XG4gICAgZWRpdG9yLnNldExpbmUoY3Vyc29yLmxpbmUsIGxpbmUuc2xpY2UoYWN0dWFsUHJlZml4TGVuZ3RoKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc3RyaXBwZWQgPSBsaW5lLnJlcGxhY2UoXG4gICAgICAvXigjezEsNn0gfC0gXFxbWyB4XHUyNzE0XVxcXSAoPzpcdUQ4M0RcdUREMzQgfFx1RDgzRFx1REZFMSApP3wtIHxcXGQrXFwuIHw+IFxcWyFbXlxcXV0rXFxdXFxuPiApLyxcbiAgICAgIFwiXCIsXG4gICAgKTtcbiAgICBlZGl0b3Iuc2V0TGluZShjdXJzb3IubGluZSwgcHJlZml4ICsgc3RyaXBwZWQpO1xuICB9XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCBIb21lVGFiIGNsYXNzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5leHBvcnQgY2xhc3MgSG9tZVRhYiB7XG4gIHByaXZhdGUgc3R5bGVzT2Zmc2V0ID0gMDtcblxuICByZW5kZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgYXBwOiBBcHApOiB2b2lkIHtcbiAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGFuZWwuY2xhc3NOYW1lID0gXCJvbnItdGFiLXBhbmVsXCI7XG4gICAgcGFuZWwuc2V0QXR0cmlidXRlKFwiZGF0YS1wYW5lbFwiLCBcIkhvbWVcIik7XG4gICAgcGFuZWwuaW5uZXJIVE1MID0gdGhpcy5idWlsZEhUTUwoKTtcbiAgICB0aGlzLmF0dGFjaEV2ZW50cyhwYW5lbCwgYXBwKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGFuZWwpO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEhUTUwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuICAgICAgJHt0aGlzLmNsaXBib2FyZEdyb3VwSFRNTCgpfVxuICAgICAgJHt0aGlzLmJhc2ljVGV4dEdyb3VwSFRNTCgpfVxuICAgICAgJHt0aGlzLnN0eWxlc0dyb3VwSFRNTCgpfVxuICAgICAgJHt0aGlzLnRhZ3NHcm91cEhUTUwoKX1cbiAgICAgICR7dGhpcy5lbWFpbEdyb3VwSFRNTCgpfVxuICAgICAgJHt0aGlzLm5hdmlnYXRlR3JvdXBIVE1MKCl9XG4gICAgYDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBDTElQQk9BUkQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgY2xpcGJvYXJkR3JvdXBIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXBcIiBkYXRhLWdyb3VwPVwiQ2xpcGJvYXJkXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtYnV0dG9uc1wiIHN0eWxlPVwiYWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MnB4XCI+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6Y2VudGVyO2dhcDowXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwicGFzdGVcIiBzdHlsZT1cIndpZHRoOjQ2cHg7bWluLWhlaWdodDo0NnB4O2JvcmRlci1ib3R0b206bm9uZTtib3JkZXItcmFkaXVzOjNweCAzcHggMCAwXCI+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBzdHlsZT1cIndpZHRoOjI0cHg7aGVpZ2h0OjI0cHhcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgIDxyZWN0IHg9XCI4XCIgeT1cIjJcIiB3aWR0aD1cIjhcIiBoZWlnaHQ9XCI0XCIgcng9XCIxXCIvPjxwYXRoIGQ9XCJNNiA0SDVhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJWNmEyIDIgMCAwIDAtMi0yaC0xXCIvPjxwb2x5bGluZSBwb2ludHM9XCI5IDE0IDEyIDE3IDE1IDE0XCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjEwXCIgeDI9XCIxMlwiIHkyPVwiMTdcIi8+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5QYXN0ZTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cInBhc3RlLWRyb3Bkb3duXCIgc3R5bGU9XCJ3aWR0aDo0NnB4O2JvcmRlci10b3A6MXB4IHNvbGlkICNkMGQwZDA7Ym9yZGVyLXJhZGl1czowIDAgM3B4IDNweDttaW4taGVpZ2h0OjE0cHg7Zm9udC1zaXplOjlweDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyXCI+XHUyNUJFPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjFweDtwYWRkaW5nLXRvcDoycHhcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJjdXRcIiBzdHlsZT1cIndpZHRoOjY4cHg7ZmxleC1kaXJlY3Rpb246cm93O2dhcDo0cHg7cGFkZGluZzoycHggNHB4XCI+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvbi1zbVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxjaXJjbGUgY3g9XCI2XCIgY3k9XCI2XCIgcj1cIjNcIi8+PGNpcmNsZSBjeD1cIjZcIiBjeT1cIjE4XCIgcj1cIjNcIi8+PGxpbmUgeDE9XCIyMFwiIHkxPVwiNFwiIHgyPVwiOC4xMlwiIHkyPVwiMTUuODhcIi8+PGxpbmUgeDE9XCIxNC40N1wiIHkxPVwiMTQuNDhcIiB4Mj1cIjIwXCIgeTI9XCIyMFwiLz48bGluZSB4MT1cIjguMTJcIiB5MT1cIjguMTJcIiB4Mj1cIjEyXCIgeTI9XCIxMlwiLz48L3N2Zz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsLXNtXCI+Q3V0PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwiY29weVwiIHN0eWxlPVwid2lkdGg6NjhweDtmbGV4LWRpcmVjdGlvbjpyb3c7Z2FwOjRweDtwYWRkaW5nOjJweCA0cHhcIj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uLXNtXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHJlY3QgeD1cIjlcIiB5PVwiOVwiIHdpZHRoPVwiMTNcIiBoZWlnaHQ9XCIxM1wiIHJ4PVwiMlwiLz48cGF0aCBkPVwiTTUgMTVINGEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg5YTIgMiAwIDAgMSAyIDJ2MVwiLz48L3N2Zz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsLXNtXCI+Q29weTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cImZvcm1hdC1wYWludGVyXCIgc3R5bGU9XCJ3aWR0aDo2OHB4O2ZsZXgtZGlyZWN0aW9uOnJvdztnYXA6NHB4O3BhZGRpbmc6MnB4IDRweFwiPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb24tc21cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTE4IDhoMWE0IDQgMCAwIDEgMCA4aC0xXCIvPjxwYXRoIGQ9XCJNMiA4aDE2djlhNCA0IDAgMCAxLTQgNEg2YTQgNCAwIDAgMS00LTRWOHpcIi8+PGxpbmUgeDE9XCI2XCIgeTE9XCIxXCIgeDI9XCI2XCIgeTI9XCI0XCIvPjxsaW5lIHgxPVwiMTBcIiB5MT1cIjFcIiB4Mj1cIjEwXCIgeTI9XCI0XCIvPjxsaW5lIHgxPVwiMTRcIiB5MT1cIjFcIiB4Mj1cIjE0XCIgeTI9XCI0XCIvPjwvc3ZnPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWwtc21cIj5Gb3JtYXQgUGFpbnRlcjwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1ncm91cC1uYW1lXCI+Q2xpcGJvYXJkPC9kaXY+XG4gICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwIEJBU0lDIFRFWFQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgYmFzaWNUZXh0R3JvdXBIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXBcIiBkYXRhLWdyb3VwPVwiQmFzaWMgVGV4dFwiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1yb3dcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjJweDtwYWRkaW5nOjJweCAwIDAgMFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc20gb25yLWZvbnQtcGlja2VyXCIgZGF0YS1jbWQ9XCJmb250LWZhbWlseVwiIHN0eWxlPVwid2lkdGg6OTZweDtmbGV4LWRpcmVjdGlvbjpyb3c7Z2FwOjJweDttaW4taGVpZ2h0OjIycHg7cGFkZGluZzoxcHggNHB4O2JvcmRlcjoxcHggc29saWQgI2M4YzZjNDtjdXJzb3I6cG9pbnRlclwiPlxuICAgICAgICAgICAgICA8c3BhbiBpZD1cIm9uci1mb250LWxhYmVsXCIgc3R5bGU9XCJmb250LXNpemU6MTBweDtjb2xvcjojMjIyXCI+U2Vnb2UgVUk8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwibWFyZ2luLWxlZnQ6YXV0bztmb250LXNpemU6OHB4O2NvbG9yOiM2NjZcIj5cdTI1QkU8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtIG9uci1mb250LXBpY2tlclwiIGRhdGEtY21kPVwiZm9udC1zaXplXCIgc3R5bGU9XCJ3aWR0aDozNHB4O2ZsZXgtZGlyZWN0aW9uOnJvdzttaW4taGVpZ2h0OjIycHg7cGFkZGluZzoxcHggNHB4O2JvcmRlcjoxcHggc29saWQgI2M4YzZjNDtjdXJzb3I6cG9pbnRlclwiPlxuICAgICAgICAgICAgICA8c3BhbiBpZD1cIm9uci1zaXplLWxhYmVsXCIgc3R5bGU9XCJmb250LXNpemU6MTBweDtjb2xvcjojMjIyXCI+MTY8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjhweDtjb2xvcjojNjY2XCI+XHUyNUJFPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwiYnVsbGV0LWxpc3RcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6MjJweDt3aWR0aDoyMnB4XCI+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvbi1zbVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxsaW5lIHgxPVwiOVwiIHkxPVwiNlwiIHgyPVwiMjBcIiB5Mj1cIjZcIi8+PGxpbmUgeDE9XCI5XCIgeTE9XCIxMlwiIHgyPVwiMjBcIiB5Mj1cIjEyXCIvPjxsaW5lIHgxPVwiOVwiIHkxPVwiMThcIiB4Mj1cIjIwXCIgeTI9XCIxOFwiLz48Y2lyY2xlIGN4PVwiNVwiIGN5PVwiNlwiIHI9XCIxLjVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlPVwibm9uZVwiLz48Y2lyY2xlIGN4PVwiNVwiIGN5PVwiMTJcIiByPVwiMS41XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIHN0cm9rZT1cIm5vbmVcIi8+PGNpcmNsZSBjeD1cIjVcIiBjeT1cIjE4XCIgcj1cIjEuNVwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBzdHJva2U9XCJub25lXCIvPjwvc3ZnPlxuICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTo3cHhcIj5cdTI1QkU8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJudW1iZXJlZC1saXN0XCIgc3R5bGU9XCJtaW4taGVpZ2h0OjIycHg7d2lkdGg6MjJweFwiPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb24tc21cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48bGluZSB4MT1cIjEwXCIgeTE9XCI2XCIgeDI9XCIyMVwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjEwXCIgeTE9XCIxMlwiIHgyPVwiMjFcIiB5Mj1cIjEyXCIvPjxsaW5lIHgxPVwiMTBcIiB5MT1cIjE4XCIgeDI9XCIyMVwiIHkyPVwiMThcIi8+PHBhdGggZD1cIk00IDZoMXY0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIvPjxwYXRoIGQ9XCJNNCAxMGgyXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIvPjxwYXRoIGQ9XCJNNiAxNEg0bDIgMi0yIDJoMlwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNVwiLz48L3N2Zz5cbiAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6N3B4XCI+XHUyNUJFPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwib3V0ZGVudFwiIHN0eWxlPVwibWluLWhlaWdodDoyMnB4O3dpZHRoOjIycHhcIj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uLXNtXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBvbHlsaW5lIHBvaW50cz1cIjcgOCAzIDEyIDcgMTZcIi8+PGxpbmUgeDE9XCIyMVwiIHkxPVwiMTJcIiB4Mj1cIjNcIiB5Mj1cIjEyXCIvPjxsaW5lIHgxPVwiMjFcIiB5MT1cIjZcIiB4Mj1cIjExXCIgeTI9XCI2XCIvPjxsaW5lIHgxPVwiMjFcIiB5MT1cIjE4XCIgeDI9XCIxMVwiIHkyPVwiMThcIi8+PC9zdmc+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJpbmRlbnRcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6MjJweDt3aWR0aDoyMnB4XCI+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvbi1zbVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwb2x5bGluZSBwb2ludHM9XCIxNyA4IDIxIDEyIDE3IDE2XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiMTJcIiB4Mj1cIjIxXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjZcIiB4Mj1cIjEzXCIgeTI9XCI2XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiMThcIiB4Mj1cIjEzXCIgeTI9XCIxOFwiLz48L3N2Zz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cImNsZWFyLWZvcm1hdHRpbmdcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6MjJweDt3aWR0aDoyMnB4XCI+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvbi1zbVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNMjAgNUg5bC03IDcgNyA3aDExYTIgMiAwIDAgMCAyLTJWN2EyIDIgMCAwIDAtMi0yelwiLz48bGluZSB4MT1cIjE4XCIgeTE9XCI5XCIgeDI9XCIxMlwiIHkyPVwiMTVcIi8+PGxpbmUgeDE9XCIxMlwiIHkxPVwiOVwiIHgyPVwiMThcIiB5Mj1cIjE1XCIvPjwvc3ZnPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1yb3dcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjJweFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cImJvbGRcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6MjJweDt3aWR0aDoyMnB4O2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTNweFwiPkI8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJpdGFsaWNcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6MjJweDt3aWR0aDoyMnB4O2ZvbnQtc3R5bGU6aXRhbGljO2ZvbnQtc2l6ZToxM3B4XCI+STwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cInVuZGVybGluZVwiIHN0eWxlPVwibWluLWhlaWdodDoyMnB4O3dpZHRoOjIycHg7dGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZTtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDBcIj5VPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwic3RyaWtldGhyb3VnaFwiIHN0eWxlPVwibWluLWhlaWdodDoyMnB4O3dpZHRoOjIycHhcIj48cyBzdHlsZT1cImZvbnQtc2l6ZToxMXB4XCI+YWI8L3M+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwic3Vic2NyaXB0XCIgc3R5bGU9XCJtaW4taGVpZ2h0OjIycHg7d2lkdGg6MjJweDtmb250LXNpemU6MTBweFwiPng8c3ViIHN0eWxlPVwiZm9udC1zaXplOjdweFwiPjI8L3N1Yj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJzdXBlcnNjcmlwdFwiIHN0eWxlPVwibWluLWhlaWdodDoyMnB4O3dpZHRoOjIycHg7Zm9udC1zaXplOjEwcHhcIj54PHN1cCBzdHlsZT1cImZvbnQtc2l6ZTo3cHhcIj4yPC9zdXA+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwid2lkdGg6MXB4O2hlaWdodDoxOHB4O2JhY2tncm91bmQ6I2QwZDBkMDttYXJnaW46MCAxcHg7ZmxleC1zaHJpbms6MFwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6Y2VudGVyO2dhcDowXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJoaWdobGlnaHRcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6MThweDt3aWR0aDoyNnB4O3BhZGRpbmc6MXB4IDJweFwiPlxuICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvbi1zbVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBzdHlsZT1cIndpZHRoOjEycHg7aGVpZ2h0OjEycHhcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNOSAxMWwtNiA2djNoM2w2LTZcIi8+PHBhdGggZD1cIk0yMiA1LjU0YTIgMiAwIDAgMC0yLjgzLTIuODNsLTExLjMgMTEuMyAyLjgzIDIuODNMMjIgNS41NHpcIi8+PC9zdmc+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cIm9uci1oaWdobGlnaHQtc3dhdGNoXCIgc3R5bGU9XCJ3aWR0aDoxNHB4O2hlaWdodDozcHg7YmFja2dyb3VuZDojRkZGRjAwO2JvcmRlcjoxcHggc29saWQgI2NjYzttYXJnaW4tdG9wOjFweFwiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTo3cHg7Y29sb3I6IzY2NjtsaW5lLWhlaWdodDoxXCI+XHUyNUJFPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwiZm9udC1jb2xvclwiIHN0eWxlPVwibWluLWhlaWdodDoxOHB4O3dpZHRoOjIycHg7cGFkZGluZzoxcHggMnB4XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTJweDtmb250LXdlaWdodDo3MDA7Y29sb3I6IzIyMjtsaW5lLWhlaWdodDoxXCI+QTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwib25yLWNvbG9yLXN3YXRjaFwiIHN0eWxlPVwid2lkdGg6MTRweDtoZWlnaHQ6M3B4O2JhY2tncm91bmQ6I0ZGMDAwMDtib3JkZXI6MXB4IHNvbGlkICNjY2M7bWFyZ2luLXRvcDoxcHhcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6N3B4O2NvbG9yOiM2NjY7bGluZS1oZWlnaHQ6MVwiPlx1MjVCRTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwid2lkdGg6MXB4O2hlaWdodDoxOHB4O2JhY2tncm91bmQ6I2QwZDBkMDttYXJnaW46MCAxcHg7ZmxleC1zaHJpbms6MFwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cImFsaWduXCIgc3R5bGU9XCJtaW4taGVpZ2h0OjIycHg7d2lkdGg6MjZweDtmbGV4LWRpcmVjdGlvbjpyb3c7Z2FwOjFweFwiPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb24tc21cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3R5bGU9XCJ3aWR0aDoxMHB4O2hlaWdodDoxMHB4XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48bGluZSB4MT1cIjNcIiB5MT1cIjZcIiB4Mj1cIjIxXCIgeTI9XCI2XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiMTJcIiB4Mj1cIjIxXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjE4XCIgeDI9XCIxNVwiIHkyPVwiMThcIi8+PC9zdmc+XG4gICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjhweFwiPlx1MjVCRTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cImNsZWFyLWlubGluZVwiIHN0eWxlPVwibWluLWhlaWdodDoyMnB4O3dpZHRoOjIycHhcIj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uLXNtXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGxpbmUgeDE9XCIxOFwiIHkxPVwiNlwiIHgyPVwiNlwiIHkyPVwiMThcIi8+PGxpbmUgeDE9XCI2XCIgeTE9XCI2XCIgeDI9XCIxOFwiIHkyPVwiMThcIi8+PC9zdmc+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtbmFtZVwiPkJhc2ljIFRleHQ8L2Rpdj5cbiAgICAgIDwvZGl2PmA7XG4gIH1cblxuICAvLyBcdTI1MDBcdTI1MDAgU1RZTEVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICBwcml2YXRlIHN0eWxlc0dyb3VwSFRNTCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHMwID0gU1RZTEVTX0xJU1RbMF07XG4gICAgY29uc3QgczEgPSBTVFlMRVNfTElTVFsxXTtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm9uci1ncm91cFwiIGRhdGEtZ3JvdXA9XCJTdHlsZXNcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpzdHJldGNoO2dhcDowXCI+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDt3aWR0aDoxMzBweFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG4tc21cIiBkYXRhLWNtZD1cInN0eWxlcy1wcmV2aWV3LTBcIiBzdHlsZT1cIndpZHRoOjEzMHB4O21pbi1oZWlnaHQ6MjhweDtiYWNrZ3JvdW5kOiMxYTFhMmU7Ym9yZGVyOjFweCBzb2xpZCAjNTU1O2JvcmRlci1yYWRpdXM6MnB4O2ZsZXgtZGlyZWN0aW9uOnJvdztqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1zdGFydDtwYWRkaW5nOjJweCA4cHhcIj5cbiAgICAgICAgICAgICAgPHNwYW4gZGF0YS1zdHlsZXMtdGV4dD1cIjBcIiBzdHlsZT1cIiR7czAuc3R5bGV9XCI+JHtzMC5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJzdHlsZXMtcHJldmlldy0xXCIgc3R5bGU9XCJ3aWR0aDoxMzBweDttaW4taGVpZ2h0OjI4cHg7YmFja2dyb3VuZDojMWExYTJlO2JvcmRlcjoxcHggc29saWQgIzU1NTtib3JkZXItcmFkaXVzOjJweDtmbGV4LWRpcmVjdGlvbjpyb3c7anVzdGlmeS1jb250ZW50OmZsZXgtc3RhcnQ7cGFkZGluZzoycHggOHB4XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGRhdGEtc3R5bGVzLXRleHQ9XCIxXCIgc3R5bGU9XCIke3MxLnN0eWxlfVwiPiR7czEubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47cGFkZGluZzoycHggMXB4O2dhcDoycHhcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuLXNtXCIgZGF0YS1jbWQ9XCJzdHlsZXMtc2Nyb2xsLXVwXCIgc3R5bGU9XCJ3aWR0aDoxNnB4O21pbi1oZWlnaHQ6MjhweDtwYWRkaW5nOjA7Zm9udC1zaXplOjlweDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyXCI+XHUyNUIyPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwic3R5bGVzLXNjcm9sbC1kb3duXCIgc3R5bGU9XCJ3aWR0aDoxNnB4O21pbi1oZWlnaHQ6MjhweDtwYWRkaW5nOjA7Zm9udC1zaXplOjlweDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyXCI+XHUyNUJDPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwic3R5bGVzLWRyb3Bkb3duXCIgc3R5bGU9XCJ3aWR0aDoxNnB4O21pbi1oZWlnaHQ6MTRweDtwYWRkaW5nOjA7Zm9udC1zaXplOjlweDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyXCI+XHUyNUJFPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwLW5hbWVcIj5TdHlsZXM8L2Rpdj5cbiAgICAgIDwvZGl2PmA7XG4gIH1cblxuICAvLyBcdTI1MDBcdTI1MDAgVEFHUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSB0YWdzR3JvdXBIVE1MKCk6IHN0cmluZyB7XG4gICAgY29uc3QgdG9wMyA9IEFMTF9UQUdTLnNsaWNlKDAsIDMpO1xuICAgIGNvbnN0IHJvd3MgPSB0b3AzXG4gICAgICAubWFwKFxuICAgICAgICAodGFnKSA9PiBgXG4gICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbSBvbnItdGFnLXJvd1wiIGRhdGEtY21kPVwiJHt0YWcuY21kfVwiIHN0eWxlPVwid2lkdGg6MTUwcHg7bWluLWhlaWdodDoyMHB4O2ZsZXgtZGlyZWN0aW9uOnJvdztnYXA6NHB4O3BhZGRpbmc6MXB4IDZweDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1zdGFydFwiPlxuICAgICAgICA8c3BhbiBzdHlsZT1cImRpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MTNweDtoZWlnaHQ6MTNweDtib3JkZXItcmFkaXVzOjJweDtmb250LXNpemU6OXB4O2ZsZXgtc2hyaW5rOjA7JHt0YWcuaWNvblN0eWxlfVwiPiR7dGFnLmljb259PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci10YWctbGFiZWxcIiBzdHlsZT1cImZvbnQtc2l6ZToxMHB4O2NvbG9yOiMyMjJcIj4ke3RhZy5sYWJlbH08L3NwYW4+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItdGFnLWNoZWNrXCIgc3R5bGU9XCJ3aWR0aDoxNHB4O2hlaWdodDoxNHB4O2JvcmRlcjoxcHggc29saWQgIzk5OTttYXJnaW4tbGVmdDphdXRvO2JhY2tncm91bmQ6I2ZmZjtmbGV4LXNocmluazowO2JvcmRlci1yYWRpdXM6MXB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlclwiPjwvZGl2PlxuICAgICAgPC9kaXY+YCxcbiAgICAgIClcbiAgICAgIC5qb2luKFwiXCIpO1xuXG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXBcIiBkYXRhLWdyb3VwPVwiVGFnc1wiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo0cHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydFwiPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoxcHg7d2lkdGg6MTUwcHhcIj5cbiAgICAgICAgICAgICR7cm93c31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2hlaWdodDo2NHB4XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0bi1zbVwiIGRhdGEtY21kPVwidGFncy1kcm9wZG93blwiIHN0eWxlPVwid2lkdGg6MTRweDttaW4taGVpZ2h0OjY0cHg7cGFkZGluZzowO2ZvbnQtc2l6ZTo5cHg7anVzdGlmeS1jb250ZW50OmNlbnRlclwiPlx1MjVCRTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJ0b2RvLXRhZ1wiIHN0eWxlPVwid2lkdGg6NDZweDttaW4taGVpZ2h0OjU4cHhcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxyZWN0IHg9XCIzXCIgeT1cIjVcIiB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMTRcIiByeD1cIjJcIi8+PGxpbmUgeDE9XCI5XCIgeTE9XCIxMlwiIHgyPVwiMTVcIiB5Mj1cIjEyXCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjlcIiB4Mj1cIjEyXCIgeTI9XCIxNVwiLz48L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPlRvIERvIFRhZzwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiZmluZC10YWdzXCIgc3R5bGU9XCJ3aWR0aDo0NnB4O21pbi1oZWlnaHQ6NThweFwiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGNpcmNsZSBjeD1cIjExXCIgY3k9XCIxMVwiIHI9XCI4XCIvPjxsaW5lIHgxPVwiMjFcIiB5MT1cIjIxXCIgeDI9XCIxNi42NVwiIHkyPVwiMTYuNjVcIi8+PGxpbmUgeDE9XCIxMVwiIHkxPVwiOFwiIHgyPVwiMTFcIiB5Mj1cIjE0XCIvPjxsaW5lIHgxPVwiOFwiIHkxPVwiMTFcIiB4Mj1cIjE0XCIgeTI9XCIxMVwiLz48L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPkZpbmQgVGFnczwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtbmFtZVwiPlRhZ3M8L2Rpdj5cbiAgICAgIDwvZGl2PmA7XG4gIH1cblxuICAvLyBcdTI1MDBcdTI1MDAgRU1BSUwgJiBNRUVUSU5HUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSBlbWFpbEdyb3VwSFRNTCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwXCIgZGF0YS1ncm91cD1cIkVtYWlsICZhbXA7IE1lZXRpbmdzXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtYnV0dG9uc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJlbWFpbC1wYWdlXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTQgNGgxNmMxLjEgMCAyIC45IDIgMnYxMmMwIDEuMS0uOSAyLTIgMkg0Yy0xLjEgMC0yLS45LTItMlY2YzAtMS4xLjktMiAyLTJ6XCIvPjxwb2x5bGluZSBwb2ludHM9XCIyMiw2IDEyLDEzIDIsNlwiLz48L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPkVtYWlsIFBhZ2U8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG5cIiBkYXRhLWNtZD1cIm1lZXRpbmctZGV0YWlsc1wiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHJlY3QgeD1cIjNcIiB5PVwiNFwiIHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHJ4PVwiMlwiLz48bGluZSB4MT1cIjE2XCIgeTE9XCIyXCIgeDI9XCIxNlwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjhcIiB5MT1cIjJcIiB4Mj1cIjhcIiB5Mj1cIjZcIi8+PGxpbmUgeDE9XCIzXCIgeTE9XCIxMFwiIHgyPVwiMjFcIiB5Mj1cIjEwXCIvPjxwYXRoIGQ9XCJNOCAxNGguMDFNMTIgMTRoLjAxTTE2IDE0aC4wMU04IDE4aC4wMU0xMiAxOGguMDFcIi8+PC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5NZWV0aW5nIERldGFpbHM8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwLW5hbWVcIj5FbWFpbCAmYW1wOyBNZWV0aW5nczwvZGl2PlxuICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBOQVZJR0FURSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSBuYXZpZ2F0ZUdyb3VwSFRNTCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwXCIgZGF0YS1ncm91cD1cIk5hdmlnYXRlXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtYnV0dG9uc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJvdXRsaW5lXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48bGluZSB4MT1cIjhcIiB5MT1cIjZcIiB4Mj1cIjIxXCIgeTI9XCI2XCIvPjxsaW5lIHgxPVwiOFwiIHkxPVwiMTJcIiB4Mj1cIjIxXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjhcIiB5MT1cIjE4XCIgeDI9XCIyMVwiIHkyPVwiMThcIi8+PGxpbmUgeDE9XCIzXCIgeTE9XCI2XCIgeDI9XCIzLjAxXCIgeTI9XCI2XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiMTJcIiB4Mj1cIjMuMDFcIiB5Mj1cIjEyXCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiMThcIiB4Mj1cIjMuMDFcIiB5Mj1cIjE4XCIvPjwvc3ZnPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsXCI+T3V0bGluZTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiZm9sZC1hbGxcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwb2x5bGluZSBwb2ludHM9XCIzIDggNiA4IDYgM1wiLz48cG9seWxpbmUgcG9pbnRzPVwiMyAxNiA2IDE2IDYgMjFcIi8+PGxpbmUgeDE9XCIyMVwiIHkxPVwiOFwiIHgyPVwiNlwiIHkyPVwiOFwiLz48bGluZSB4MT1cIjIxXCIgeTE9XCIxNlwiIHgyPVwiNlwiIHkyPVwiMTZcIi8+PC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5Gb2xkIEFsbDwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwidW5mb2xkLWFsbFwiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBvbHlsaW5lIHBvaW50cz1cIjIxIDggMTggOCAxOCAzXCIvPjxwb2x5bGluZSBwb2ludHM9XCIyMSAxNiAxOCAxNiAxOCAyMVwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjhcIiB4Mj1cIjE4XCIgeTI9XCI4XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiMTZcIiB4Mj1cIjE4XCIgeTI9XCIxNlwiLz48L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPlVuZm9sZCBBbGw8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwLW5hbWVcIj5OYXZpZ2F0ZTwvZGl2PlxuICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBFVkVOVFMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgYXR0YWNoRXZlbnRzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGFwcDogQXBwKTogdm9pZCB7XG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1jbWRdXCIpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH0pO1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZUNvbW1hbmQoXG4gICAgICAgICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1jbWRcIiksXG4gICAgICAgICAgYXBwLFxuICAgICAgICAgIGVsIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQ3Vyc29yLWF3YXJlIHN0YXRlIHRyYWNraW5nXG4gICAgLy8gVXNlIGNhcHR1cmUtcGhhc2UgY2xpY2sva2V5dXAgb24gdGhlIHdvcmtzcGFjZSBzbyB3ZSBjYXRjaCBjdXJzb3IgbW92ZW1lbnRcbiAgICAvLyBhZnRlciB0aGUgZWRpdG9yIGhhcyBwcm9jZXNzZWQgdGhlIGV2ZW50ICh2aWEgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKS5cbiAgICBjb25zdCBvbkVkaXRvckludGVyYWN0ID0gKCkgPT4ge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMudXBkYXRlUmliYm9uU3RhdGUoY29udGFpbmVyLCBhcHApKTtcbiAgICB9O1xuICAgIGNvbnN0IHdvcmtzcGFjZUVsID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud29ya3NwYWNlXCIpID8/IGRvY3VtZW50LmJvZHk7XG4gICAgd29ya3NwYWNlRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uRWRpdG9ySW50ZXJhY3QsIHRydWUpO1xuICAgIHdvcmtzcGFjZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBvbkVkaXRvckludGVyYWN0LCB0cnVlKTtcblxuICAgIC8vIEZvcm1hdCBQYWludGVyOiBhdXRvLWFwcGx5IHdoZW4gdXNlciBmaW5pc2hlcyBhIGRyYWctc2VsZWN0IChPbmVOb3RlLXN0eWxlKVxuICAgIHdvcmtzcGFjZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlKSA9PiB7XG4gICAgICBpZiAoISh3aW5kb3cgYXMgYW55KS5fb25yRlBBY3RpdmUpIHJldHVybjtcbiAgICAgIC8vIElmIG1vdXNldXAgaXMgb24gYSByaWJib24gYnV0dG9uLCBsZXQgdGhlIGNsaWNrIGhhbmRsZXIgZG8gcGhhc2UgMiBpbnN0ZWFkXG4gICAgICBpZiAoKGUudGFyZ2V0IGFzIEVsZW1lbnQpPy5jbG9zZXN0KFwiW2RhdGEtY21kXVwiKSkgcmV0dXJuO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWQgPSBhcHAud29ya3NwYWNlLmFjdGl2ZUVkaXRvcj8uZWRpdG9yO1xuICAgICAgICBjb25zdCBmcCA9ICh3aW5kb3cgYXMgYW55KS5fb25yRlAgYXMge1xuICAgICAgICAgIGhlYWRQcmVmaXg6IHN0cmluZzsgaXNCb2xkOiBib29sZWFuO1xuICAgICAgICAgIGlzSXRhbGljOiBib29sZWFuOyBpc1VuZGVybGluZTogYm9vbGVhbjtcbiAgICAgICAgfSB8IG51bGw7XG4gICAgICAgIGNvbnN0IHNlbCA9IGVkPy5nZXRTZWxlY3Rpb24oKTtcblxuICAgICAgICAvLyBBbHdheXMgcmVzZXQgRlAgc3RhdGUgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHdlIGFwcGx5XG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5fb25yRlBBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLl9vbnJGUCA9IG51bGw7XG4gICAgICAgIGNvbnN0IGZwQnRuID0gKFxuICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtY21kPVxcXCJmb3JtYXQtcGFpbnRlclxcXCJdXCIpID8/XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtcGFuZWw9XCJIb21lXCJdIFtkYXRhLWNtZD1cImZvcm1hdC1wYWludGVyXCJdJylcbiAgICAgICAgKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgICAgIGlmIChmcEJ0bikgZnBCdG4uY2xhc3NMaXN0LnJlbW92ZShcIm9uci1hY3RpdmVcIik7XG5cbiAgICAgICAgaWYgKCFmcCB8fCAhZWQgfHwgIXNlbCkgcmV0dXJuO1xuICAgICAgICAvLyBBcHBseSBpbmxpbmUgZm9ybWF0c1xuICAgICAgICBsZXQgcmVzdWx0ID0gc2VsO1xuICAgICAgICBpZiAoZnAuaXNVbmRlcmxpbmUpIHJlc3VsdCA9IGA8dT4ke3Jlc3VsdH08L3U+YDtcbiAgICAgICAgaWYgKGZwLmlzSXRhbGljKSByZXN1bHQgPSBgKiR7cmVzdWx0fSpgO1xuICAgICAgICBpZiAoZnAuaXNCb2xkKSByZXN1bHQgPSBgKioke3Jlc3VsdH0qKmA7XG4gICAgICAgIGVkLnJlcGxhY2VTZWxlY3Rpb24ocmVzdWx0KTtcbiAgICAgICAgaWYgKGZwLmhlYWRQcmVmaXgpIHtcbiAgICAgICAgICBjb25zdCBjID0gZWQuZ2V0Q3Vyc29yKCk7XG4gICAgICAgICAgY29uc3QgbCA9IGVkLmdldExpbmUoYy5saW5lKTtcbiAgICAgICAgICBpZiAoIWwuc3RhcnRzV2l0aChmcC5oZWFkUHJlZml4KSkge1xuICAgICAgICAgICAgZWQuc2V0TGluZShjLmxpbmUsIGZwLmhlYWRQcmVmaXggKyBsLnJlcGxhY2UoL14jezEsNn1cXHMrLywgXCJcIikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICAvLyBBbHNvIGhvb2sgd29ya3NwYWNlIGV2ZW50cyB0byBoYW5kbGUgbGVhZiBzd2l0Y2hlcyBhbmQgY29udGVudCBjaGFuZ2VzXG4gICAgYXBwLndvcmtzcGFjZS5vbihcImFjdGl2ZS1sZWFmLWNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlUmliYm9uU3RhdGUoY29udGFpbmVyLCBhcHApLCAxNTApO1xuICAgIH0pO1xuICAgIGFwcC53b3Jrc3BhY2Uub24oXCJlZGl0b3ItY2hhbmdlXCIsICgpID0+IHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLnVwZGF0ZVJpYmJvblN0YXRlKGNvbnRhaW5lciwgYXBwKSk7XG4gICAgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlUmliYm9uU3RhdGUoY29udGFpbmVyLCBhcHApLCAzMDApO1xuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwIFVQREFURSBSSUJCT04gU1RBVEUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgdXBkYXRlUmliYm9uU3RhdGUocGFuZWw6IEhUTUxFbGVtZW50LCBhcHA6IEFwcCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvciA9IGFwcC53b3Jrc3BhY2UuYWN0aXZlRWRpdG9yPy5lZGl0b3I7XG4gICAgaWYgKCFlZGl0b3IpIHJldHVybjtcblxuICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICBjb25zdCBsaW5lID0gZWRpdG9yLmdldExpbmUoY3Vyc29yLmxpbmUpO1xuXG4gICAgLy8gSGVhZGluZyBkZXRlY3Rpb25cbiAgICBjb25zdCBoZWFkTWF0Y2ggPSBsaW5lLm1hdGNoKC9eKCN7MSw2fSlcXHMvKTtcbiAgICBjb25zdCBoZWFkTGV2ZWwgPSBoZWFkTWF0Y2ggPyBoZWFkTWF0Y2hbMV0ubGVuZ3RoIDogMDtcblxuICAgIC8vIFNjcm9sbCBzdHlsZXMgcHJldmlldyB0byBzaG93IGN1cnJlbnQgaGVhZGluZ1xuICAgIGlmIChoZWFkTGV2ZWwgPj0gMSAmJiBoZWFkTGV2ZWwgPD0gNikge1xuICAgICAgY29uc3QgbmV3T2Zmc2V0ID0gTWF0aC5tYXgoXG4gICAgICAgIDAsXG4gICAgICAgIE1hdGgubWluKGhlYWRMZXZlbCAtIDEsIFNUWUxFU19MSVNULmxlbmd0aCAtIDIpLFxuICAgICAgKTtcbiAgICAgIGlmIChuZXdPZmZzZXQgIT09IHRoaXMuc3R5bGVzT2Zmc2V0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzT2Zmc2V0ID0gbmV3T2Zmc2V0O1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlc1ByZXZpZXcocGFuZWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhlbHBlcjogdG9nZ2xlIGFjdGl2ZSBjbGFzcyBvbiBhIGJ1dHRvblxuICAgIGNvbnN0IHNldEFjdGl2ZSA9IChjbWQ6IHN0cmluZywgYWN0aXZlOiBib29sZWFuKSA9PiB7XG4gICAgICBjb25zdCBidG4gPSBwYW5lbC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jbWQ9XCIke2NtZH1cIl1gKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgIGlmIChidG4pIGJ0bi5jbGFzc0xpc3QudG9nZ2xlKFwib25yLWFjdGl2ZVwiLCBhY3RpdmUpO1xuICAgIH07XG5cbiAgICAvLyBTdHJpcCBIVE1MIHRhZ3MgZnJvbSBsaW5lIGZvciBtYXJrZG93biBkZXRlY3Rpb24gKGhhbmRsZXMgc3BhbnMgd3JhcHBpbmcgKiopXG4gICAgY29uc3QgbWRDb250ZW50ID0gbGluZS5yZXBsYWNlKC88W14+XSs+L2csIFwiXCIpO1xuXG4gICAgLy8gSW5saW5lIGZvcm1hdHRpbmcgZGV0ZWN0aW9uXG4gICAgc2V0QWN0aXZlKFwiYm9sZFwiLCAvXFwqXFwqKC4qPylcXCpcXCovLnRlc3QobWRDb250ZW50KSk7XG4gICAgc2V0QWN0aXZlKFwiaXRhbGljXCIsIC8oPzwhXFwqKVxcKigoPyFcXCopLis/KVxcKig/IVxcKikvLnRlc3QobWRDb250ZW50KSk7XG4gICAgc2V0QWN0aXZlKFwidW5kZXJsaW5lXCIsIC88dT4vLnRlc3QobGluZSkpO1xuICAgIHNldEFjdGl2ZShcInN0cmlrZXRocm91Z2hcIiwgL35+KC4qPyl+fi8udGVzdChtZENvbnRlbnQpKTtcbiAgICBzZXRBY3RpdmUoXCJoaWdobGlnaHRcIiwgLz09KC4qPyk9PS8udGVzdChtZENvbnRlbnQpKTtcbiAgICAvLyBzdWIvc3VwOiBvbmx5IGFjdGl2ZSB3aGVuIGN1cnNvciBpcyBpbnNpZGUgdGhlIHRhZyBzcGFuXG4gICAgY29uc3QgY2ggPSBjdXJzb3IuY2g7XG4gICAgY29uc3QgaXNJblN1YiA9ICgoKSA9PiB7IGxldCBwID0gMDsgd2hpbGUgKHAgPCBsaW5lLmxlbmd0aCkgeyBjb25zdCBvID0gbGluZS5pbmRleE9mKFwiPHN1Yj5cIiwgcCk7IGlmIChvIDwgMCkgYnJlYWs7IGNvbnN0IGMyID0gbGluZS5pbmRleE9mKFwiPC9zdWI+XCIsIG8pOyBpZiAoYzIgPCAwKSBicmVhazsgaWYgKGNoID4gbyArIDQgJiYgY2ggPCBjMiArIDYpIHJldHVybiB0cnVlOyBwID0gYzIgKyA2OyB9IHJldHVybiBmYWxzZTsgfSkoKTtcbiAgICBjb25zdCBpc0luU3VwID0gKCgpID0+IHsgbGV0IHAgPSAwOyB3aGlsZSAocCA8IGxpbmUubGVuZ3RoKSB7IGNvbnN0IG8gPSBsaW5lLmluZGV4T2YoXCI8c3VwPlwiLCBwKTsgaWYgKG8gPCAwKSBicmVhazsgY29uc3QgYzIgPSBsaW5lLmluZGV4T2YoXCI8L3N1cD5cIiwgbyk7IGlmIChjMiA8IDApIGJyZWFrOyBpZiAoY2ggPiBvICsgNCAmJiBjaCA8IGMyICsgNikgcmV0dXJuIHRydWU7IHAgPSBjMiArIDY7IH0gcmV0dXJuIGZhbHNlOyB9KSgpO1xuICAgIHNldEFjdGl2ZShcInN1YnNjcmlwdFwiLCBpc0luU3ViKTtcbiAgICBzZXRBY3RpdmUoXCJzdXBlcnNjcmlwdFwiLCBpc0luU3VwKTtcblxuICAgIC8vIExpc3QgdHlwZVxuICAgIHNldEFjdGl2ZShcImJ1bGxldC1saXN0XCIsIC9eKFxccyopLSAvLnRlc3QobGluZSkpO1xuICAgIHNldEFjdGl2ZShcIm51bWJlcmVkLWxpc3RcIiwgL14oXFxzKilcXGQrXFwuIC8udGVzdChsaW5lKSk7XG5cbiAgICAvLyBIZWFkaW5nIGFjdGl2ZSBzdGF0ZTogaGlnaGxpZ2h0IHRoZSBtYXRjaGluZyBzdHlsZXMgcHJldmlldyBjYXJkXG4gICAgWzAsIDFdLmZvckVhY2goKGkpID0+IHtcbiAgICAgIGNvbnN0IGNhcmQgPSBwYW5lbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgW2RhdGEtY21kPVwic3R5bGVzLXByZXZpZXctJHtpfVwiXWAsXG4gICAgICApIGFzIEhUTUxFbGVtZW50O1xuICAgICAgaWYgKCFjYXJkKSByZXR1cm47XG4gICAgICBjb25zdCBzID0gU1RZTEVTX0xJU1RbdGhpcy5zdHlsZXNPZmZzZXQgKyBpXTtcbiAgICAgIGlmICghcykgeyBjYXJkLmNsYXNzTGlzdC5yZW1vdmUoXCJvbnItYWN0aXZlXCIpOyByZXR1cm47IH1cbiAgICAgIGNvbnN0IGlzQWN0aXZlID1cbiAgICAgICAgKGhlYWRMZXZlbCA+IDAgJiYgcy5wcmVmaXggPT09IFwiI1wiLnJlcGVhdChoZWFkTGV2ZWwpICsgXCIgXCIpIHx8XG4gICAgICAgIChoZWFkTGV2ZWwgPT09IDAgJiYgcy5sYWJlbCA9PT0gXCJOb3JtYWxcIik7XG4gICAgICBjYXJkLmNsYXNzTGlzdC50b2dnbGUoXCJvbnItYWN0aXZlXCIsIGlzQWN0aXZlKTtcbiAgICB9KTtcblxuICAgIC8vIEZvbnQvc2l6ZSBmcm9tIHZhdWx0IGNvbmZpZ1xuICAgIGNvbnN0IGZvbnRMYWJlbCA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3IoXCIjb25yLWZvbnQtbGFiZWxcIikgYXMgSFRNTEVsZW1lbnQ7XG4gICAgaWYgKGZvbnRMYWJlbCkge1xuICAgICAgY29uc3QgZiA9IChhcHAudmF1bHQgYXMgYW55KS5nZXRDb25maWc/LihcImZvbnRUZXh0XCIpO1xuICAgICAgaWYgKGYpIGZvbnRMYWJlbC50ZXh0Q29udGVudCA9IGY7XG4gICAgfVxuICAgIGNvbnN0IHNpemVMYWJlbCA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3IoXCIjb25yLXNpemUtbGFiZWxcIikgYXMgSFRNTEVsZW1lbnQ7XG4gICAgaWYgKHNpemVMYWJlbCkge1xuICAgICAgY29uc3QgcyA9IChhcHAudmF1bHQgYXMgYW55KS5nZXRDb25maWc/LihcImJhc2VGb250U2l6ZVwiKTtcbiAgICAgIGlmIChzKSBzaXplTGFiZWwudGV4dENvbnRlbnQgPSBTdHJpbmcocyk7XG4gICAgfVxuXG4gICAgLy8gVGFnIGNoZWNrc1xuICAgIHRoaXMucmVmcmVzaFRhZ0NoZWNrcyhlZGl0b3IpO1xuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwIFVQREFURSBTVFlMRVMgUFJFVklFVyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSB1cGRhdGVTdHlsZXNQcmV2aWV3KHBhbmVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIFswLCAxXS5mb3JFYWNoKChpKSA9PiB7XG4gICAgICBjb25zdCBjYXJkID0gcGFuZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYFtkYXRhLWNtZD1cInN0eWxlcy1wcmV2aWV3LSR7aX1cIl1gLFxuICAgICAgKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgIGlmICghY2FyZCkgcmV0dXJuO1xuICAgICAgY29uc3QgaXRlbSA9IFNUWUxFU19MSVNUW3RoaXMuc3R5bGVzT2Zmc2V0ICsgaV07XG4gICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgY2FyZC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNhcmQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICBjb25zdCBzcGFuID0gY2FyZC5xdWVyeVNlbGVjdG9yKFwic3BhblwiKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgIGlmIChzcGFuKSB7XG4gICAgICAgIHNwYW4udGV4dENvbnRlbnQgPSBpdGVtLmxhYmVsO1xuICAgICAgICBzcGFuLnN0eWxlLmNzc1RleHQgPSBpdGVtLnN0eWxlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBleGVjdXRlQ29tbWFuZChcbiAgICBjbWQ6IHN0cmluZyB8IG51bGwsXG4gICAgYXBwOiBBcHAsXG4gICAgYW5jaG9yPzogSFRNTEVsZW1lbnQsXG4gICAgcGFuZWw/OiBIVE1MRWxlbWVudCxcbiAgKTogdm9pZCB7XG4gICAgaWYgKCFjbWQpIHJldHVybjtcbiAgICBjb25zdCBlZGl0b3IgPSBhcHAud29ya3NwYWNlLmFjdGl2ZUVkaXRvcj8uZWRpdG9yO1xuICAgIGNvbnN0IGV4ZWMgPSAoaWQ6IHN0cmluZykgPT4gYXBwLmNvbW1hbmRzLmV4ZWN1dGVDb21tYW5kQnlJZChpZCk7XG5cbiAgICBzd2l0Y2ggKGNtZCkge1xuICAgICAgLy8gXHUyNTAwXHUyNTAwIENsaXBib2FyZCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICAgIGNhc2UgXCJwYXN0ZVwiOiB7XG4gICAgICAgIGlmIChlZGl0b3IpIHtcbiAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkXG4gICAgICAgICAgICAucmVhZFRleHQoKVxuICAgICAgICAgICAgLnRoZW4oKHRleHQpID0+IHtcbiAgICAgICAgICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24odGV4dCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGZvY3VzIGVkaXRvciBlbGVtZW50IGFuZCB1c2Uga2V5Ym9hcmQgc2hvcnRjdXRcbiAgICAgICAgICAgICAgY29uc3QgZWwgPVxuICAgICAgICAgICAgICAgIChlZGl0b3IgYXMgYW55KS5jbT8uZG9tID8/XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jbS1jb250ZW50XCIpO1xuICAgICAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgICAgICBlbC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwicGFzdGVcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcInBhc3RlLWRyb3Bkb3duXCI6IHtcbiAgICAgICAgaWYgKCFhbmNob3IpIGJyZWFrO1xuICAgICAgICBzaG93RHJvcGRvd24oYW5jaG9yLCBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwiUGFzdGVcIixcbiAgICAgICAgICAgIHN1YmxhYmVsOiBcIkN0cmwrVlwiLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlZGl0b3IpXG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZFxuICAgICAgICAgICAgICAgICAgLnJlYWRUZXh0KClcbiAgICAgICAgICAgICAgICAgIC50aGVuKCh0KSA9PiBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbih0KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwiUGFzdGUgYXMgUGxhaW4gVGV4dFwiLFxuICAgICAgICAgICAgc3VibGFiZWw6IFwiQ3RybCtTaGlmdCtWXCIsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVkaXRvcilcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLnJlYWRUZXh0KCkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gU3RyaXAgSFRNTFxuICAgICAgICAgICAgICAgICAgY29uc3QgcGxhaW4gPSB0XG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88W14+XSs+L2csIFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHJcXG4vZywgXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihwbGFpbik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwiUGFzdGUgU3BlY2lhbC4uLlwiLFxuICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IHt9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJjdXRcIjoge1xuICAgICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgICAgY29uc3Qgc2VsID0gZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgIGlmIChzZWwpIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmRcbiAgICAgICAgICAgICAgLndyaXRlVGV4dChzZWwpXG4gICAgICAgICAgICAgIC50aGVuKCgpID0+IGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKFwiXCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiY29weVwiOiB7XG4gICAgICAgIGlmIChlZGl0b3IpIHtcbiAgICAgICAgICBjb25zdCBzZWwgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgaWYgKHNlbCkgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoc2VsKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIEJhc2ljIFRleHQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgICBjYXNlIFwiYm9sZFwiOlxuICAgICAgICBpZiAoZWRpdG9yKSB0b2dnbGVJbmxpbmUoZWRpdG9yLCBcIioqXCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJpdGFsaWNcIjpcbiAgICAgICAgaWYgKGVkaXRvcikgdG9nZ2xlSW5saW5lKGVkaXRvciwgXCIqXCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ1bmRlcmxpbmVcIjpcbiAgICAgICAgaWYgKGVkaXRvcikgdG9nZ2xlSW5saW5lKGVkaXRvciwgXCI8dT5cIiwgXCI8L3U+XCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzdHJpa2V0aHJvdWdoXCI6XG4gICAgICAgIGlmIChlZGl0b3IpIHRvZ2dsZUlubGluZShlZGl0b3IsIFwifn5cIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImhpZ2hsaWdodFwiOlxuICAgICAgICBpZiAoZWRpdG9yKSB0b2dnbGVJbmxpbmUoZWRpdG9yLCBcIj09XCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzdWJzY3JpcHRcIjpcbiAgICAgICAgaWYgKGVkaXRvcikgdG9nZ2xlSW5saW5lKGVkaXRvciwgXCI8c3ViPlwiLCBcIjwvc3ViPlwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwic3VwZXJzY3JpcHRcIjpcbiAgICAgICAgaWYgKGVkaXRvcikgdG9nZ2xlSW5saW5lKGVkaXRvciwgXCI8c3VwPlwiLCBcIjwvc3VwPlwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJidWxsZXQtbGlzdFwiOlxuICAgICAgICBpZiAoZWRpdG9yKSB0b2dnbGVMaW5lUHJlZml4KGVkaXRvciwgXCItIFwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwibnVtYmVyZWQtbGlzdFwiOlxuICAgICAgICBpZiAoZWRpdG9yKSB0b2dnbGVMaW5lUHJlZml4KGVkaXRvciwgXCIxLiBcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImluZGVudFwiOlxuICAgICAgICBleGVjKFwiZWRpdG9yOmluZGVudC1saXN0XCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvdXRkZW50XCI6XG4gICAgICAgIGV4ZWMoXCJlZGl0b3I6dW5pbmRlbnQtbGlzdFwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJjbGVhci1mb3JtYXR0aW5nXCI6IHtcbiAgICAgICAgaWYgKCFlZGl0b3IpIGJyZWFrO1xuICAgICAgICBjb25zdCBoYXNTZWwgPSAhIWVkaXRvci5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgY29uc3Qgc2VsID0gaGFzU2VsXG4gICAgICAgICAgPyBlZGl0b3IuZ2V0U2VsZWN0aW9uKClcbiAgICAgICAgICA6IGVkaXRvci5nZXRMaW5lKGVkaXRvci5nZXRDdXJzb3IoKS5saW5lKTtcbiAgICAgICAgY29uc3QgY2xlYW5lZCA9IHNlbFxuICAgICAgICAgIC5yZXBsYWNlKC9eI3sxLDZ9XFxzKy9nbSwgXCJcIilcbiAgICAgICAgICAucmVwbGFjZSgvXFwqXFwqKC4qPylcXCpcXCovZ3MsIFwiJDFcIilcbiAgICAgICAgICAucmVwbGFjZSgvXFwqKC4qPylcXCovZ3MsIFwiJDFcIilcbiAgICAgICAgICAucmVwbGFjZSgvXyguKj8pXy9ncywgXCIkMVwiKVxuICAgICAgICAgIC5yZXBsYWNlKC9+figuKj8pfn4vZ3MsIFwiJDFcIilcbiAgICAgICAgICAucmVwbGFjZSgvPT0oLio/KT09L2dzLCBcIiQxXCIpXG4gICAgICAgICAgLnJlcGxhY2UoL2AoLio/KWAvZ3MsIFwiJDFcIilcbiAgICAgICAgICAucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpO1xuICAgICAgICBpZiAoaGFzU2VsKSBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjbGVhbmVkKTtcbiAgICAgICAgZWxzZSBlZGl0b3Iuc2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSwgY2xlYW5lZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcImNsZWFyLWlubGluZVwiOiB7XG4gICAgICAgIGlmICghZWRpdG9yKSBicmVhaztcbiAgICAgICAgY29uc3QgaGFzU2VsMiA9ICEhZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuICAgICAgICBjb25zdCByYXcyID0gaGFzU2VsMlxuICAgICAgICAgID8gZWRpdG9yLmdldFNlbGVjdGlvbigpXG4gICAgICAgICAgOiBlZGl0b3IuZ2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSk7XG4gICAgICAgIGNvbnN0IGNsZWFuZWQyID0gcmF3MlxuICAgICAgICAgIC5yZXBsYWNlKC9cXCpcXCooLio/KVxcKlxcKi9ncywgXCIkMVwiKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXCooLio/KVxcKi9ncywgXCIkMVwiKVxuICAgICAgICAgIC5yZXBsYWNlKC9fKC4qPylfL2dzLCBcIiQxXCIpXG4gICAgICAgICAgLnJlcGxhY2UoL35+KC4qPyl+fi9ncywgXCIkMVwiKVxuICAgICAgICAgIC5yZXBsYWNlKC89PSguKj8pPT0vZ3MsIFwiJDFcIilcbiAgICAgICAgICAucmVwbGFjZSgvYCguKj8pYC9ncywgXCIkMVwiKVxuICAgICAgICAgIC5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIik7XG4gICAgICAgIGlmIChoYXNTZWwyKSBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjbGVhbmVkMik7XG4gICAgICAgIGVsc2UgZWRpdG9yLnNldExpbmUoZWRpdG9yLmdldEN1cnNvcigpLmxpbmUsIGNsZWFuZWQyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1MjUwMFx1MjUwMCBGb250IGZhbWlseSAvIHNpemUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgICBjYXNlIFwiZm9udC1mYW1pbHlcIjoge1xuICAgICAgICBpZiAoIWFuY2hvcikgYnJlYWs7XG4gICAgICAgIGNvbnN0IGZvbnRzID0gW1xuICAgICAgICAgIFwiU2Vnb2UgVUlcIixcbiAgICAgICAgICBcIkFyaWFsXCIsXG4gICAgICAgICAgXCJDYWxpYnJpXCIsXG4gICAgICAgICAgXCJDYW1icmlhXCIsXG4gICAgICAgICAgXCJDb25zb2xhc1wiLFxuICAgICAgICAgIFwiQ291cmllciBOZXdcIixcbiAgICAgICAgICBcIkdlb3JnaWFcIixcbiAgICAgICAgICBcIkhlbHZldGljYVwiLFxuICAgICAgICAgIFwiVGltZXMgTmV3IFJvbWFuXCIsXG4gICAgICAgICAgXCJUcmVidWNoZXQgTVNcIixcbiAgICAgICAgICBcIlZlcmRhbmFcIixcbiAgICAgICAgICBcIkNvbWljIFNhbnMgTVNcIixcbiAgICAgICAgXTtcbiAgICAgICAgc2hvd0Ryb3Bkb3duKFxuICAgICAgICAgIGFuY2hvcixcbiAgICAgICAgICBmb250cy5tYXAoKGYpID0+ICh7XG4gICAgICAgICAgICBsYWJlbDogZixcbiAgICAgICAgICAgIHN0eWxlOiBgZm9udC1mYW1pbHk6JHtmfTtmb250LXNpemU6MTJweGAsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbGJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvbnItZm9udC1sYWJlbFwiKTtcbiAgICAgICAgICAgICAgaWYgKGxibCkgbGJsLnRleHRDb250ZW50ID0gZjtcbiAgICAgICAgICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbCA9IGVkaXRvci5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsKVxuICAgICAgICAgICAgICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgIGA8c3BhbiBzdHlsZT1cImZvbnQtZmFtaWx5OiR7Zn1cIj4ke3NlbH08L3NwYW4+YCxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAoYXBwLnZhdWx0IGFzIGFueSkuc2V0Q29uZmlnKFwiZm9udFRleHRcIiwgZik7XG4gICAgICAgICAgICAgICAgICBhcHAud29ya3NwYWNlLnRyaWdnZXIoXCJjc3MtY2hhbmdlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSksXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcImZvbnQtc2l6ZVwiOiB7XG4gICAgICAgIGlmICghYW5jaG9yKSBicmVhaztcbiAgICAgICAgY29uc3Qgc2l6ZXMgPSBbXG4gICAgICAgICAgOCwgOSwgMTAsIDExLCAxMiwgMTQsIDE2LCAxOCwgMjAsIDIyLCAyNCwgMjgsIDMyLCAzNiwgNDgsIDcyLFxuICAgICAgICBdO1xuICAgICAgICBzaG93RHJvcGRvd24oXG4gICAgICAgICAgYW5jaG9yLFxuICAgICAgICAgIHNpemVzLm1hcCgocykgPT4gKHtcbiAgICAgICAgICAgIGxhYmVsOiBgJHtzfWAsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbGJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvbnItc2l6ZS1sYWJlbFwiKTtcbiAgICAgICAgICAgICAgaWYgKGxibCkgbGJsLnRleHRDb250ZW50ID0gU3RyaW5nKHMpO1xuICAgICAgICAgICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsID0gZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChzZWwpXG4gICAgICAgICAgICAgICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgYDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiR7c31weFwiPiR7c2VsfTwvc3Bhbj5gLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIChhcHAudmF1bHQgYXMgYW55KS5zZXRDb25maWcoXCJiYXNlRm9udFNpemVcIiwgcyk7XG4gICAgICAgICAgICAgICAgICBhcHAud29ya3NwYWNlLnRyaWdnZXIoXCJjc3MtY2hhbmdlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSksXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcImZvbnQtY29sb3JcIjoge1xuICAgICAgICBpZiAoIWFuY2hvcikgYnJlYWs7XG4gICAgICAgIGNvbnN0IGNvbG9ycyA9IFtcbiAgICAgICAgICB7IGxhYmVsOiBcIkJsYWNrXCIsIGhleDogXCIjMDAwMDAwXCIgfSxcbiAgICAgICAgICB7IGxhYmVsOiBcIkRhcmsgUmVkXCIsIGhleDogXCIjQzAwMDAwXCIgfSxcbiAgICAgICAgICB7IGxhYmVsOiBcIlJlZFwiLCBoZXg6IFwiI0ZGMDAwMFwiIH0sXG4gICAgICAgICAgeyBsYWJlbDogXCJPcmFuZ2VcIiwgaGV4OiBcIiNGRjY2MDBcIiB9LFxuICAgICAgICAgIHsgbGFiZWw6IFwiWWVsbG93XCIsIGhleDogXCIjRkZGRjAwXCIgfSxcbiAgICAgICAgICB7IGxhYmVsOiBcIkdyZWVuXCIsIGhleDogXCIjMDBCMDUwXCIgfSxcbiAgICAgICAgICB7IGxhYmVsOiBcIkJsdWVcIiwgaGV4OiBcIiMwMDcwQzBcIiB9LFxuICAgICAgICAgIHsgbGFiZWw6IFwiUHVycGxlXCIsIGhleDogXCIjNzAzMEEwXCIgfSxcbiAgICAgICAgICB7IGxhYmVsOiBcIldoaXRlXCIsIGhleDogXCIjRkZGRkZGXCIgfSxcbiAgICAgICAgICB7IGxhYmVsOiBcIkdyYXlcIiwgaGV4OiBcIiM4MDgwODBcIiB9LFxuICAgICAgICBdO1xuICAgICAgICBzaG93RHJvcGRvd24oXG4gICAgICAgICAgYW5jaG9yLFxuICAgICAgICAgIGNvbG9ycy5tYXAoKGMpID0+ICh7XG4gICAgICAgICAgICBsYWJlbDogYy5sYWJlbCxcbiAgICAgICAgICAgIHN0eWxlOiBgY29sb3I6JHtjLmhleH07JHtjLmhleCA9PT0gXCIjRkZGRkZGXCIgPyBcImJhY2tncm91bmQ6IzMzM1wiIDogXCJcIn1gLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHN3ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvbnItY29sb3Itc3dhdGNoXCIpO1xuICAgICAgICAgICAgICBpZiAoc3cpIHN3LnN0eWxlLmJhY2tncm91bmQgPSBjLmhleDtcbiAgICAgICAgICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbCA9IGVkaXRvci5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsKVxuICAgICAgICAgICAgICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgIGA8c3BhbiBzdHlsZT1cImNvbG9yOiR7Yy5oZXh9XCI+JHtzZWx9PC9zcGFuPmAsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pKSxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1MjUwMFx1MjUwMCBBbGlnbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICAgIGNhc2UgXCJhbGlnblwiOiB7XG4gICAgICAgIGlmICghYW5jaG9yKSBicmVhaztcbiAgICAgICAgY29uc3QgYWxpZ25PcHRpb25zID0gW1xuICAgICAgICAgIHsgbGFiZWw6IFwiXHUyMUQwICBBbGlnbiBMZWZ0XCIsIGFsaWduOiBcImxlZnRcIiwgc2hvcnRjdXQ6IFwiQ3RybCtMXCIgfSxcbiAgICAgICAgICB7IGxhYmVsOiBcIlx1MjFENCAgQ2VudGVyXCIsIGFsaWduOiBcImNlbnRlclwiLCBzaG9ydGN1dDogXCJDdHJsK0VcIiB9LFxuICAgICAgICAgIHsgbGFiZWw6IFwiXHUyMUQyICBBbGlnbiBSaWdodFwiLCBhbGlnbjogXCJyaWdodFwiLCBzaG9ydGN1dDogXCJDdHJsK1JcIiB9LFxuICAgICAgICAgIHsgbGFiZWw6IFwiXHUyMUQ0ICBKdXN0aWZ5XCIsIGFsaWduOiBcImp1c3RpZnlcIiwgc2hvcnRjdXQ6IFwiQ3RybCtKXCIgfSxcbiAgICAgICAgXTtcbiAgICAgICAgc2hvd0Ryb3Bkb3duKFxuICAgICAgICAgIGFuY2hvcixcbiAgICAgICAgICBhbGlnbk9wdGlvbnMubWFwKChvKSA9PiAoe1xuICAgICAgICAgICAgbGFiZWw6IG8ubGFiZWwsXG4gICAgICAgICAgICBzdWJsYWJlbDogby5zaG9ydGN1dCxcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoIWVkaXRvcikge1xuICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJObyBhY3RpdmUgZWRpdG9yXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBzZWwgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgIGlmIChzZWwpIHtcbiAgICAgICAgICAgICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihcbiAgICAgICAgICAgICAgICAgIGA8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjoke28uYWxpZ259XCI+XFxuXFxuJHtzZWx9XFxuXFxuPC9kaXY+YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLnNldExpbmUoXG4gICAgICAgICAgICAgICAgICBlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSxcbiAgICAgICAgICAgICAgICAgIGA8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjoke28uYWxpZ259XCI+JHtsaW5lfTwvZGl2PmAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSksXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgU3R5bGVzIHNjcm9sbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICAgIGNhc2UgXCJzdHlsZXMtc2Nyb2xsLXVwXCI6IHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzT2Zmc2V0ID4gMCkge1xuICAgICAgICAgIHRoaXMuc3R5bGVzT2Zmc2V0LS07XG4gICAgICAgICAgY29uc3QgcCA9XG4gICAgICAgICAgICBwYW5lbCA/P1xuICAgICAgICAgICAgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXBhbmVsPVwiSG9tZVwiXScpIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICBpZiAocCkgdGhpcy51cGRhdGVTdHlsZXNQcmV2aWV3KHApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcInN0eWxlcy1zY3JvbGwtZG93blwiOiB7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlc09mZnNldCA8IFNUWUxFU19MSVNULmxlbmd0aCAtIDIpIHtcbiAgICAgICAgICB0aGlzLnN0eWxlc09mZnNldCsrO1xuICAgICAgICAgIGNvbnN0IHAgPVxuICAgICAgICAgICAgcGFuZWwgPz9cbiAgICAgICAgICAgIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1wYW5lbD1cIkhvbWVcIl0nKSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgaWYgKHApIHRoaXMudXBkYXRlU3R5bGVzUHJldmlldyhwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIFN0eWxlcyBwcmV2aWV3IGNhcmRzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgICAgY2FzZSBcInN0eWxlcy1wcmV2aWV3LTBcIjpcbiAgICAgIGNhc2UgXCJzdHlsZXMtcHJldmlldy0xXCI6IHtcbiAgICAgICAgaWYgKCFlZGl0b3IpIGJyZWFrO1xuICAgICAgICBjb25zdCBpZHggPVxuICAgICAgICAgIHRoaXMuc3R5bGVzT2Zmc2V0ICsgKGNtZCA9PT0gXCJzdHlsZXMtcHJldmlldy0wXCIgPyAwIDogMSk7XG4gICAgICAgIGNvbnN0IHMgPSBTVFlMRVNfTElTVFtpZHhdO1xuICAgICAgICBpZiAoIXMpIGJyZWFrO1xuICAgICAgICBpZiAocy5zdWZmaXgpIHtcbiAgICAgICAgICBjb25zdCBzZWwgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oYCR7cy5wcmVmaXh9JHtzZWwgfHwgXCJcIn0ke3Muc3VmZml4fWApO1xuICAgICAgICB9IGVsc2UgaWYgKHMucHJlZml4ID09PSBcIlwiKSB7XG4gICAgICAgICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0TGluZShjdXJzb3IubGluZSk7XG4gICAgICAgICAgZWRpdG9yLnNldExpbmUoY3Vyc29yLmxpbmUsIGxpbmUucmVwbGFjZSgvXiN7MSw2fVxccysvLCBcIlwiKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9nZ2xlTGluZVByZWZpeChlZGl0b3IsIHMucHJlZml4KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIFN0eWxlcyBkcm9wZG93biBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICAgIGNhc2UgXCJzdHlsZXMtZHJvcGRvd25cIjoge1xuICAgICAgICBpZiAoIWFuY2hvcikgYnJlYWs7XG4gICAgICAgIHNob3dEcm9wZG93bihcbiAgICAgICAgICBhbmNob3IsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgLi4uU1RZTEVTX0xJU1QubWFwKChzKSA9PiAoe1xuICAgICAgICAgICAgICBsYWJlbDogcy5sYWJlbCxcbiAgICAgICAgICAgICAgc3R5bGU6IHMuc3R5bGUgKyBcIjtwYWRkaW5nOjRweCAxMnB4XCIsXG4gICAgICAgICAgICAgIGFjdGlvbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKHMuc3VmZml4KSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzZWwgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgYCR7cy5wcmVmaXh9JHtzZWwgfHwgXCJcIn0ke3Muc3VmZml4fWAsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocy5wcmVmaXggPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0TGluZShjdXJzb3IubGluZSk7XG4gICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0TGluZShjdXJzb3IubGluZSwgbGluZS5yZXBsYWNlKC9eI3sxLDZ9XFxzKy8sIFwiXCIpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdG9nZ2xlTGluZVByZWZpeChlZGl0b3IsIHMucHJlZml4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICB7IGxhYmVsOiBcIlwiLCBkaXZpZGVyOiB0cnVlLCBhY3Rpb246ICgpID0+IHt9IH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIlx1RDgzRVx1RERGOSAgQ2xlYXIgRm9ybWF0dGluZ1wiLFxuICAgICAgICAgICAgICBzdHlsZTogXCJmb250LXNpemU6MTFweDtjb2xvcjojZTBlMGUwXCIsXG4gICAgICAgICAgICAgIGFjdGlvbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzU2VsMyA9ICEhZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhdzMgPSBoYXNTZWwzXG4gICAgICAgICAgICAgICAgICA/IGVkaXRvci5nZXRTZWxlY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgOiBlZGl0b3IuZ2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xlYW5lZDMgPSByYXczXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXiN7MSw2fVxccysvZ20sIFwiXCIpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwqXFwqKC4qPylcXCpcXCovZ3MsIFwiJDFcIilcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCooLio/KVxcKi9ncywgXCIkMVwiKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL18oLio/KV8vZ3MsIFwiJDFcIilcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9+figuKj8pfn4vZ3MsIFwiJDFcIilcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC89PSguKj8pPT0vZ3MsIFwiJDFcIilcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9gKC4qPylgL2dzLCBcIiQxXCIpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgIGlmIChoYXNTZWwzKSBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjbGVhbmVkMyk7XG4gICAgICAgICAgICAgICAgZWxzZSBlZGl0b3Iuc2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSwgY2xlYW5lZDMpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHsgYmc6IFwiIzFhMWEyZVwiLCBob3ZlckJnOiBcIiMyYTJhNGVcIiwgY29sb3I6IFwiI2UwZTBlMFwiIH0sXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgVGFncyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICAgIGNhc2UgXCJ0b2RvXCI6XG4gICAgICBjYXNlIFwidG9kby10YWdcIjpcbiAgICAgICAgaWYgKGVkaXRvcikgdG9nZ2xlTGluZVByZWZpeChlZGl0b3IsIFwiLSBbIF0gXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInRhZ3MtZHJvcGRvd25cIjoge1xuICAgICAgICBpZiAoYW5jaG9yKSBzaG93VGFnc0Ryb3Bkb3duKGFuY2hvciwgYXBwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIFRhZyByb3dzICh2aXNpYmxlIG9uIHJpYmJvbilcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgaWYgKGNtZC5zdGFydHNXaXRoKFwidGFnLVwiKSAmJiBlZGl0b3IpIHtcbiAgICAgICAgICBhcHBseVRhZyhjbWQsIGVkaXRvcik7XG4gICAgICAgICAgdGhpcy5yZWZyZXNoVGFnQ2hlY2tzKGVkaXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgXCJpbXBvcnRhbnRcIjpcbiAgICAgICAgaWYgKGVkaXRvcilcbiAgICAgICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFwiPiBbIWltcG9ydGFudF1cXG4+IFwiLCBlZGl0b3IuZ2V0Q3Vyc29yKCkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJxdWVzdGlvblwiOlxuICAgICAgICBpZiAoZWRpdG9yKVxuICAgICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoXCI+IFshcXVlc3Rpb25dXFxuPiBcIiwgZWRpdG9yLmdldEN1cnNvcigpKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJmaW5kLXRhZ3NcIjoge1xuICAgICAgICBleGVjKFwiZ2xvYmFsLXNlYXJjaDpvcGVuXCIpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICBcIi5zZWFyY2gtaW5wdXQtY29udGFpbmVyIGlucHV0XCIsXG4gICAgICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBcIiNcIjtcbiAgICAgICAgICAgIGlucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiZW1haWwtcGFnZVwiOiB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlZGl0b3I/LmdldFZhbHVlKCkgPz8gXCJcIjtcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZFxuICAgICAgICAgIC53cml0ZVRleHQoY29udGVudClcbiAgICAgICAgICAudGhlbigoKSA9PiBuZXcgTm90aWNlKFwiUGFnZSBjb250ZW50IGNvcGllZCB0byBjbGlwYm9hcmRcIikpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJtZWV0aW5nLWRldGFpbHNcIjoge1xuICAgICAgICBpZiAoIWVkaXRvcikgYnJlYWs7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHRtcGwgPSBgLS0tXFxuRGF0ZTogJHtub3cudG9Mb2NhbGVEYXRlU3RyaW5nKCl9XFxuVGltZTogJHtub3cudG9Mb2NhbGVUaW1lU3RyaW5nKFtdLCB7IGhvdXI6IFwiMi1kaWdpdFwiLCBtaW51dGU6IFwiMi1kaWdpdFwiIH0pfVxcbkF0dGVuZGVlczogXFxuQWdlbmRhOiBcXG4tLS1cXG5cXG5gO1xuICAgICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKHRtcGwsIGVkaXRvci5nZXRDdXJzb3IoKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcIm91dGxpbmVcIjpcbiAgICAgICAgZXhlYyhcIm91dGxpbmU6b3BlblwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZm9sZC1hbGxcIjpcbiAgICAgICAgZXhlYyhcImVkaXRvcjpmb2xkLWFsbFwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwidW5mb2xkLWFsbFwiOlxuICAgICAgICBleGVjKFwiZWRpdG9yOnVuZm9sZC1hbGxcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgRm9ybWF0IFBhaW50ZXIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgICBjYXNlIFwiZm9ybWF0LXBhaW50ZXJcIjoge1xuICAgICAgICBpZiAoIWVkaXRvciB8fCAhYW5jaG9yKSBicmVhaztcblxuICAgICAgICAvLyBQaGFzZSAyOiBhbHJlYWR5IGFjdGl2ZSBcdTIwMTQgYXBwbHkgc3RvcmVkIGZvcm1hdCB0byBjdXJyZW50IHNlbGVjdGlvblxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl9vbnJGUEFjdGl2ZSkge1xuICAgICAgICAgIGNvbnN0IHN0b3JlZCA9ICh3aW5kb3cgYXMgYW55KS5fb25yRlAgYXMge1xuICAgICAgICAgICAgaGVhZFByZWZpeDogc3RyaW5nOyBpc0JvbGQ6IGJvb2xlYW47XG4gICAgICAgICAgICBpc0l0YWxpYzogYm9vbGVhbjsgaXNVbmRlcmxpbmU6IGJvb2xlYW47XG4gICAgICAgICAgfSB8IG51bGw7XG4gICAgICAgICAgY29uc3QgZnBTZWwgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgaWYgKHN0b3JlZCAmJiBmcFNlbCkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZwU2VsO1xuICAgICAgICAgICAgaWYgKHN0b3JlZC5pc1VuZGVybGluZSkgcmVzdWx0ID0gYDx1PiR7cmVzdWx0fTwvdT5gO1xuICAgICAgICAgICAgaWYgKHN0b3JlZC5pc0l0YWxpYykgcmVzdWx0ID0gYCoke3Jlc3VsdH0qYDtcbiAgICAgICAgICAgIGlmIChzdG9yZWQuaXNCb2xkKSByZXN1bHQgPSBgKioke3Jlc3VsdH0qKmA7XG4gICAgICAgICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihyZXN1bHQpO1xuICAgICAgICAgICAgaWYgKHN0b3JlZC5oZWFkUHJlZml4KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZwQ3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICAgICAgICBjb25zdCBmcExpbmUgPSBlZGl0b3IuZ2V0TGluZShmcEN1cnNvci5saW5lKTtcbiAgICAgICAgICAgICAgaWYgKCFmcExpbmUuc3RhcnRzV2l0aChzdG9yZWQuaGVhZFByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0TGluZShcbiAgICAgICAgICAgICAgICAgIGZwQ3Vyc29yLmxpbmUsXG4gICAgICAgICAgICAgICAgICBzdG9yZWQuaGVhZFByZWZpeCArIGZwTGluZS5yZXBsYWNlKC9eI3sxLDZ9XFxzKy8sIFwiXCIpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHN0b3JlZCAmJiAhZnBTZWwpIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJGb3JtYXQgUGFpbnRlcjogc2VsZWN0IHRleHQgZmlyc3QsIHRoZW4gY2xpY2sgYWdhaW5cIik7XG4gICAgICAgICAgICBicmVhazsgLy8gS2VlcCBhY3RpdmUgXHUyMDE0IGRvbid0IHJlc2V0XG4gICAgICAgICAgfVxuICAgICAgICAgICh3aW5kb3cgYXMgYW55KS5fb25yRlBBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAod2luZG93IGFzIGFueSkuX29uckZQID0gbnVsbDtcbiAgICAgICAgICBhbmNob3IuY2xhc3NMaXN0LnJlbW92ZShcIm9uci1hY3RpdmVcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQaGFzZSAxOiByZWFkIGZvcm1hdHRpbmcgZnJvbSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgIGNvbnN0IGZwQ3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICBjb25zdCBmcExpbmUgPSBlZGl0b3IuZ2V0TGluZShmcEN1cnNvci5saW5lKTtcbiAgICAgICAgY29uc3QgZnBTZWwgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGNvbnN0IGZwU3JjID0gZnBTZWwgfHwgZnBMaW5lO1xuICAgICAgICBjb25zdCBmcEhlYWQgPSBmcExpbmUubWF0Y2goL14oI3sxLDZ9ICkvKTtcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLl9vbnJGUCA9IHtcbiAgICAgICAgICBoZWFkUHJlZml4OiBmcEhlYWQgPyBmcEhlYWRbMV0gOiBcIlwiLFxuICAgICAgICAgIGlzQm9sZDogL1xcKlxcKiguKj8pXFwqXFwqLy50ZXN0KGZwU3JjKSxcbiAgICAgICAgICBpc0l0YWxpYzogLyg/PCFcXCopXFwqKCg/IVxcKikuKz8pXFwqKD8hXFwqKS8udGVzdChmcFNyYyksXG4gICAgICAgICAgaXNVbmRlcmxpbmU6IC88dT4vLnRlc3QoZnBTcmMpLFxuICAgICAgICB9O1xuICAgICAgICAod2luZG93IGFzIGFueSkuX29uckZQQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgYW5jaG9yLmNsYXNzTGlzdC5hZGQoXCJvbnItYWN0aXZlXCIpO1xuICAgICAgICBuZXcgTm90aWNlKFwiRm9ybWF0IFBhaW50ZXI6IHNlbGVjdCB0YXJnZXQgdGV4dCB0aGVuIGNsaWNrIGFnYWluIHRvIGFwcGx5XCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUmUtZXZhbHVhdGUgdGhlIDMgdmlzaWJsZSB0YWctcm93IGNoZWNrYm94ZXMgYWdhaW5zdCBjdXJyZW50IGxpbmUgKi9cbiAgcHJpdmF0ZSByZWZyZXNoVGFnQ2hlY2tzKGVkaXRvcjogYW55KTogdm9pZCB7XG4gICAgY29uc3QgbGluZVRleHQgPSBlZGl0b3IuZ2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSk7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1wYW5lbD1cIkhvbWVcIl0gLm9uci10YWctcm93JylcbiAgICAgIC5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgY29uc3QgY21kID0gcm93LmdldEF0dHJpYnV0ZShcImRhdGEtY21kXCIpID8/IFwiXCI7XG4gICAgICAgIGNvbnN0IG5vdGF0aW9uID0gdGFnTm90YXRpb24oY21kKTtcbiAgICAgICAgY29uc3QgY2hlY2sgPSByb3cucXVlcnlTZWxlY3RvcihcIi5vbnItdGFnLWNoZWNrXCIpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgaWYgKCFjaGVjayB8fCAhbm90YXRpb24pIHJldHVybjtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gbGluZVRleHQuaW5jbHVkZXMobm90YXRpb24uc3BsaXQoXCJcXG5cIilbMF0udHJpbSgpKTtcbiAgICAgICAgY2hlY2suc3R5bGUuYmFja2dyb3VuZCA9IGFjdGl2ZSA/IFwiIzQ0NzJDNFwiIDogXCIjZmZmXCI7XG4gICAgICAgIGNoZWNrLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgY2hlY2suc3R5bGUuYWxpZ25JdGVtcyA9IFwiY2VudGVyXCI7XG4gICAgICAgIGNoZWNrLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJjZW50ZXJcIjtcbiAgICAgICAgY2hlY2suaW5uZXJIVE1MID0gYWN0aXZlXG4gICAgICAgICAgPyAnPHN2ZyB2aWV3Qm94PVwiMCAwIDEyIDEyXCIgc3R5bGU9XCJ3aWR0aDoxMHB4O2hlaWdodDoxMHB4XCI+PHBvbHlsaW5lIHBvaW50cz1cIjIsNiA1LDkgMTAsM1wiIHN0cm9rZT1cIndoaXRlXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIGZpbGw9XCJub25lXCIvPjwvc3ZnPidcbiAgICAgICAgICA6IFwiXCI7XG4gICAgICB9KTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG5jb25zdCBDQUxMT1VUX1RZUEVTID0gW1xuICAnbm90ZScsICdhYnN0cmFjdCcsICdpbmZvJywgJ3RpcCcsICdzdWNjZXNzJyxcbiAgJ3F1ZXN0aW9uJywgJ3dhcm5pbmcnLCAnZmFpbHVyZScsICdkYW5nZXInLCAnYnVnJywgJ2V4YW1wbGUnLCAncXVvdGUnLFxuXTtcblxuZXhwb3J0IGNsYXNzIEluc2VydFRhYiB7XG4gIHJlbmRlcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBhcHA6IEFwcCk6IHZvaWQge1xuICAgIGNvbnN0IHBhbmVsID0gY29udGFpbmVyLmNyZWF0ZURpdigpO1xuICAgIHBhbmVsLmFkZENsYXNzKCdvbnItdGFiLXBhbmVsJyk7XG4gICAgcGFuZWwuc2V0QXR0cmlidXRlKCdkYXRhLXBhbmVsJywgJ0luc2VydCcpO1xuICAgIHBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgcGFuZWwuaW5uZXJIVE1MID0gdGhpcy5idWlsZEhUTUwoKTtcbiAgICB0aGlzLmF0dGFjaEV2ZW50cyhwYW5lbCwgYXBwKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGFuZWwpO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEhUTUwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuICAgICAgJHt0aGlzLmluc2VydEdyb3VwSFRNTCgpfVxuICAgICAgJHt0aGlzLnRhYmxlc0dyb3VwSFRNTCgpfVxuICAgICAgJHt0aGlzLmZpbGVzR3JvdXBIVE1MKCl9XG4gICAgICAke3RoaXMuaW1hZ2VzR3JvdXBIVE1MKCl9XG4gICAgICAke3RoaXMubGlua3NHcm91cEhUTUwoKX1cbiAgICAgICR7dGhpcy50aW1lU3RhbXBHcm91cEhUTUwoKX1cbiAgICAgICR7dGhpcy5ibG9ja3NHcm91cEhUTUwoKX1cbiAgICAgICR7dGhpcy5zeW1ib2xzR3JvdXBIVE1MKCl9XG4gICAgYDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBJTlNFUlQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgaW5zZXJ0R3JvdXBIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXBcIiBkYXRhLWdyb3VwPVwiSW5zZXJ0XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtYnV0dG9uc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJibGFuay1saW5lXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMlwiIHkxPVwiNVwiIHgyPVwiMTJcIiB5Mj1cIjE5XCIvPjxsaW5lIHgxPVwiNVwiIHkxPVwiMTJcIiB4Mj1cIjE5XCIgeTI9XCIxMlwiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsXCI+QmxhbmsgTGluZTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtbmFtZVwiPkluc2VydDwvZGl2PlxuICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBUQUJMRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgdGFibGVzR3JvdXBIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXBcIiBkYXRhLWdyb3VwPVwiVGFibGVzXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtYnV0dG9uc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJpbnNlcnQtdGFibGVcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiM1wiIHk9XCIzXCIgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgcng9XCIyXCIvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTMgOWgxOE0zIDE1aDE4TTkgM3YxOE0xNSAzdjE4XCIvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5UYWJsZTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtbmFtZVwiPlRhYmxlczwvZGl2PlxuICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBGSUxFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSBmaWxlc0dyb3VwSFRNTCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwXCIgZGF0YS1ncm91cD1cIkZpbGVzXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtYnV0dG9uc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJhdHRhY2gtZmlsZVwiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMjEuNDQgMTEuMDVsLTkuMTkgOS4xOWE2IDYgMCAwIDEtOC40OS04LjQ5bDkuMTktOS4xOWE0IDQgMCAwIDEgNS42NiA1LjY2bC05LjIgOS4xOWEyIDIgMCAwIDEtMi44My0yLjgzbDguNDktOC40OFwiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsXCI+QXR0YWNoIEZpbGU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG5cIiBkYXRhLWNtZD1cImVtYmVkLW5vdGVcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTQgMjJoMTRhMiAyIDAgMCAwIDItMlY3LjVMMTQuNSAySDZhMiAyIDAgMCAwLTIgMnY0XCIvPlxuICAgICAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPVwiMTQgMiAxNCA4IDIwIDhcIi8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMiAxNWgxMFwiLz48cGF0aCBkPVwiTTkgMTJsMyAzLTMgM1wiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsXCI+RW1iZWQgTm90ZTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtbmFtZVwiPkZpbGVzPC9kaXY+XG4gICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwIElNQUdFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSBpbWFnZXNHcm91cEhUTUwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm9uci1ncm91cFwiIGRhdGEtZ3JvdXA9XCJJbWFnZXNcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1ncm91cC1idXR0b25zXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG5cIiBkYXRhLWNtZD1cImluc2VydC1pbWFnZVwiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIzXCIgeT1cIjNcIiB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiByeD1cIjJcIi8+XG4gICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCI4LjVcIiBjeT1cIjguNVwiIHI9XCIxLjVcIi8+XG4gICAgICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9XCIyMSAxNSAxNiAxMCA1IDIxXCIvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5JbWFnZTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiaW5zZXJ0LXZpZGVvXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICAgPHBvbHlnb24gcG9pbnRzPVwiMjMgNyAxNiAxMiAyMyAxNyAyMyA3XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMVwiIHk9XCI1XCIgd2lkdGg9XCIxNVwiIGhlaWdodD1cIjE0XCIgcng9XCIyXCIvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5WaWRlbzwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtbmFtZVwiPkltYWdlczwvZGl2PlxuICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBMSU5LUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSBsaW5rc0dyb3VwSFRNTCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwXCIgZGF0YS1ncm91cD1cIkxpbmtzXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtYnV0dG9uc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJpbnNlcnQtbGlua1wiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MVwiLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MVwiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsXCI+TGluazwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiaW5zZXJ0LXdpa2lsaW5rXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk00IDIyaDE0YTIgMiAwIDAgMCAyLTJWNy41TDE0LjUgMkg2YTIgMiAwIDAgMC0yIDJ2NFwiLz5cbiAgICAgICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz1cIjE0IDIgMTQgOCAyMCA4XCIvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTIgMTVoMTBcIi8+PHBhdGggZD1cIk05IDEybDMgMy0zIDNcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPltbV2lraWxpbmtdXTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXAtbmFtZVwiPkxpbmtzPC9kaXY+XG4gICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwIFRJTUUgU1RBTVAgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgdGltZVN0YW1wR3JvdXBIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXBcIiBkYXRhLWdyb3VwPVwiVGltZSBTdGFtcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwLWJ1dHRvbnNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiaW5zZXJ0LWRhdGVcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiM1wiIHk9XCI0XCIgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgcng9XCIyXCIvPlxuICAgICAgICAgICAgICA8bGluZSB4MT1cIjE2XCIgeTE9XCIyXCIgeDI9XCIxNlwiIHkyPVwiNlwiLz5cbiAgICAgICAgICAgICAgPGxpbmUgeDE9XCI4XCIgeTE9XCIyXCIgeDI9XCI4XCIgeTI9XCI2XCIvPlxuICAgICAgICAgICAgICA8bGluZSB4MT1cIjNcIiB5MT1cIjEwXCIgeDI9XCIyMVwiIHkyPVwiMTBcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPkRhdGU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG5cIiBkYXRhLWNtZD1cImluc2VydC10aW1lXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIxMFwiLz5cbiAgICAgICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz1cIjEyIDYgMTIgMTIgMTYgMTRcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPlRpbWU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG5cIiBkYXRhLWNtZD1cImluc2VydC1kYXRldGltZVwiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMjEgNy41VjZhMiAyIDAgMCAwLTItMkg1YTIgMiAwIDAgMC0yIDJ2MTRhMiAyIDAgMCAwIDIgMmgzLjVcIi8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTYgMnY0TTggMnY0TTMgMTBoNVwiLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjE3LjVcIiBjeT1cIjE3LjVcIiByPVwiNC41XCIvPlxuICAgICAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPVwiMTcuNSAxNS41IDE3LjUgMTcuNSAxOSAxOC41XCIvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5EYXRlICZhbXA7IFRpbWU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwLW5hbWVcIj5UaW1lIFN0YW1wPC9kaXY+XG4gICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwIEJMT0NLUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSBibG9ja3NHcm91cEhUTUwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm9uci1ncm91cFwiIGRhdGEtZ3JvdXA9XCJCbG9ja3NcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1ncm91cC1idXR0b25zXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG5cIiBkYXRhLWNtZD1cImluc2VydC10ZW1wbGF0ZVwiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm9uci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS44XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIzXCIgeT1cIjNcIiB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiNVwiIHJ4PVwiMVwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjNcIiB5PVwiMTJcIiB3aWR0aD1cIjRcIiBoZWlnaHQ9XCI5XCIgcng9XCIxXCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMTFcIiB5PVwiMTJcIiB3aWR0aD1cIjEwXCIgaGVpZ2h0PVwiOVwiIHJ4PVwiMVwiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsXCI+VGVtcGxhdGU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1idG5cIiBkYXRhLWNtZD1cImluc2VydC1jYWxsb3V0XCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk0zIDExbDE5LTl2MThMMyAxM1wiLz48cGF0aCBkPVwiTTExLjYgMTYuOGEzIDMgMCAxIDEtNS44LTEuNlwiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvbnItYnRuLWxhYmVsXCI+Q2FsbG91dDwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiaW5zZXJ0LWNvZGUtYmxvY2tcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPVwiMTYgMTggMjIgMTIgMTYgNlwiLz5cbiAgICAgICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz1cIjggNiAyIDEyIDggMThcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPkNvZGUgQmxvY2s8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwLW5hbWVcIj5CbG9ja3M8L2Rpdj5cbiAgICAgIDwvZGl2PmA7XG4gIH1cblxuICAvLyBcdTI1MDBcdTI1MDAgU1lNQk9MUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgcHJpdmF0ZSBzeW1ib2xzR3JvdXBIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJvbnItZ3JvdXBcIiBkYXRhLWdyb3VwPVwiU3ltYm9sc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWdyb3VwLWJ1dHRvbnNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiaW5zZXJ0LW1hdGhcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE4IDdINWw3IDUtNyA1aDEzXCIvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj5NYXRoICQkPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJpbnNlcnQtaHJcIj5cbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJvbnItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuOFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICA8bGluZSB4MT1cIjVcIiB5MT1cIjEyXCIgeDI9XCIxOVwiIHkyPVwiMTJcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPkhvcml6b250YWwgUnVsZTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib25yLWJ0blwiIGRhdGEtY21kPVwiaW5zZXJ0LWZvb3Rub3RlXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz1cIjE1IDEwIDIwIDE1IDE1IDIwXCIvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTQgNHY3YTQgNCAwIDAgMCA0IDRoMTJcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib25yLWJ0bi1sYWJlbFwiPkZvb3Rub3RlPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbnItYnRuXCIgZGF0YS1jbWQ9XCJpbnNlcnQtdGFnXCI+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwib25yLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjhcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICAgPGxpbmUgeDE9XCI0XCIgeTE9XCI5XCIgeDI9XCIyMFwiIHkyPVwiOVwiLz5cbiAgICAgICAgICAgICAgPGxpbmUgeDE9XCI0XCIgeTE9XCIxNVwiIHgyPVwiMjBcIiB5Mj1cIjE1XCIvPlxuICAgICAgICAgICAgICA8bGluZSB4MT1cIjEwXCIgeTE9XCIzXCIgeDI9XCI4XCIgeTI9XCIyMVwiLz5cbiAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxNlwiIHkxPVwiM1wiIHgyPVwiMTRcIiB5Mj1cIjIxXCIvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9uci1idG4tbGFiZWxcIj4jVGFnPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1ncm91cC1uYW1lXCI+U3ltYm9sczwvZGl2PlxuICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMCBFVkVOVFMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIHByaXZhdGUgYXR0YWNoRXZlbnRzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGFwcDogQXBwKTogdm9pZCB7XG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWNtZF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pO1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jbWQnKSwgYXBwLCBjb250YWluZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGV4ZWN1dGVDb21tYW5kKGNtZDogc3RyaW5nIHwgbnVsbCwgYXBwOiBBcHAsIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAoIWNtZCkgcmV0dXJuO1xuICAgIGNvbnN0IGVkaXRvciA9IGFwcC53b3Jrc3BhY2UuYWN0aXZlRWRpdG9yPy5lZGl0b3I7XG5cbiAgICBjb25zdCBpbnNlcnRBdEN1cnNvciA9ICh0ZXh0OiBzdHJpbmcsIG9mZnNldEJhY2sgPSAwKSA9PiB7XG4gICAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZSh0ZXh0LCBjdXJzb3IpO1xuICAgICAgaWYgKG9mZnNldEJhY2sgPiAwKSB7XG4gICAgICAgIGNvbnN0IG5ld0xpbmUgPSBjdXJzb3IubGluZSArIHRleHQuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDE7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGNvbnN0IG5ld0NoID0gb2Zmc2V0QmFjayA9PT0gMCA/IGN1cnNvci5jaCArIHRleHQubGVuZ3RoXG4gICAgICAgICAgOiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5sZW5ndGggLSBvZmZzZXRCYWNrO1xuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKHsgbGluZTogbmV3TGluZSwgY2g6IG5ld0NoIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBmbXREYXRlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICBjb25zdCBtID0gKHdpbmRvdyBhcyBhbnkpLm1vbWVudDtcbiAgICAgIHJldHVybiBtID8gbSgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpIDogKCgpID0+IHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHJldHVybiBgJHtkLmdldEZ1bGxZZWFyKCl9LSR7U3RyaW5nKGQuZ2V0TW9udGgoKSsxKS5wYWRTdGFydCgyLCcwJyl9LSR7U3RyaW5nKGQuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCcwJyl9YDtcbiAgICAgIH0pKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGZtdFRpbWUgPSAoKTogc3RyaW5nID0+IHtcbiAgICAgIGNvbnN0IG0gPSAod2luZG93IGFzIGFueSkubW9tZW50O1xuICAgICAgcmV0dXJuIG0gPyBtKCkuZm9ybWF0KCdISDptbScpIDogKCgpID0+IHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHJldHVybiBgJHtTdHJpbmcoZC5nZXRIb3VycygpKS5wYWRTdGFydCgyLCcwJyl9OiR7U3RyaW5nKGQuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCcwJyl9YDtcbiAgICAgIH0pKCk7XG4gICAgfTtcblxuICAgIHN3aXRjaCAoY21kKSB7XG4gICAgICBjYXNlICdibGFuay1saW5lJzpcbiAgICAgICAgaW5zZXJ0QXRDdXJzb3IoJ1xcbicpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnaW5zZXJ0LXRhYmxlJzoge1xuICAgICAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgICAgICBjb25zdCB0YWJsZSA9ICdcXG58IGNvbCB8IGNvbCB8IGNvbCB8XFxufC0tLXwtLS18LS0tfFxcbnwgfCB8IHxcXG4nO1xuICAgICAgICBpbnNlcnRBdEN1cnNvcih0YWJsZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdhdHRhY2gtZmlsZSc6XG4gICAgICBjYXNlICdlbWJlZC1ub3RlJzoge1xuICAgICAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoJyFbW11dJywgY3Vyc29yKTtcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcih7IGxpbmU6IGN1cnNvci5saW5lLCBjaDogY3Vyc29yLmNoICsgMyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ2luc2VydC1pbWFnZSc6IHtcbiAgICAgICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKCchW1tdXScsIGN1cnNvcik7XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3IoeyBsaW5lOiBjdXJzb3IubGluZSwgY2g6IGN1cnNvci5jaCArIDMgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnQtdmlkZW8nOiB7XG4gICAgICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHRwbCA9ICdcXG48aWZyYW1lIHNyYz1cIlwiIHdpZHRoPVwiNTYwXCIgaGVpZ2h0PVwiMzE1XCIgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlxcbic7XG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZSh0cGwsIGN1cnNvcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnQtbGluayc6IHtcbiAgICAgICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2VsID0gZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuICAgICAgICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGlmIChzZWwpIHtcbiAgICAgICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihgWyR7c2VsfV0oKWApO1xuICAgICAgICAgIGNvbnN0IG5ld0N1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKHsgbGluZTogbmV3Q3Vyc29yLmxpbmUsIGNoOiBuZXdDdXJzb3IuY2ggLSAxIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoJ1tdKCknLCBjdXJzb3IpO1xuICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3IoeyBsaW5lOiBjdXJzb3IubGluZSwgY2g6IGN1cnNvci5jaCArIDEgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ2luc2VydC13aWtpbGluayc6IHtcbiAgICAgICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKCdbW11dJywgY3Vyc29yKTtcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcih7IGxpbmU6IGN1cnNvci5saW5lLCBjaDogY3Vyc29yLmNoICsgMiB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ2luc2VydC1kYXRlJzpcbiAgICAgICAgaW5zZXJ0QXRDdXJzb3IoZm10RGF0ZSgpKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2luc2VydC10aW1lJzpcbiAgICAgICAgaW5zZXJ0QXRDdXJzb3IoZm10VGltZSgpKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2luc2VydC1kYXRldGltZSc6XG4gICAgICAgIGluc2VydEF0Q3Vyc29yKGAke2ZtdERhdGUoKX0gJHtmbXRUaW1lKCl9YCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdpbnNlcnQtdGVtcGxhdGUnOiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGFwcC5jb21tYW5kcy5leGVjdXRlQ29tbWFuZEJ5SWQoJ2luc2VydC10ZW1wbGF0ZScpO1xuICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ0VuYWJsZSB0aGUgVGVtcGxhdGVzIG9yIFRlbXBsYXRlciBwbHVnaW4gdG8gdXNlIHRoaXMgZmVhdHVyZScpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnQtY2FsbG91dCc6XG4gICAgICAgIHRoaXMuc2hvd0NhbGxvdXRQaWNrZXIoZWRpdG9yLCBjb250YWluZXIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnaW5zZXJ0LWNvZGUtYmxvY2snOiB7XG4gICAgICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgICAgY29uc3QgYmxvY2sgPSAnYGBgXFxuXFxuYGBgJztcbiAgICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShibG9jaywgY3Vyc29yKTtcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcih7IGxpbmU6IGN1cnNvci5saW5lICsgMSwgY2g6IDAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnQtbWF0aCc6IHtcbiAgICAgICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKCckJFxcblxcbiQkJywgY3Vyc29yKTtcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcih7IGxpbmU6IGN1cnNvci5saW5lICsgMSwgY2g6IDAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnQtaHInOlxuICAgICAgICBpbnNlcnRBdEN1cnNvcignXFxuLS0tXFxuJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdpbnNlcnQtZm9vdG5vdGUnOiB7XG4gICAgICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZSgnW14xXScsIGN1cnNvcik7XG4gICAgICAgIGNvbnN0IGxhc3RMaW5lID0gZWRpdG9yLmxhc3RMaW5lKCk7XG4gICAgICAgIGNvbnN0IGVuZFBvcyA9IHsgbGluZTogbGFzdExpbmUsIGNoOiBlZGl0b3IuZ2V0TGluZShsYXN0TGluZSkubGVuZ3RoIH07XG4gICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoJ1xcblteMV06ICcsIGVuZFBvcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnQtdGFnJzoge1xuICAgICAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoJyMnLCBjdXJzb3IpO1xuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKHsgbGluZTogY3Vyc29yLmxpbmUsIGNoOiBjdXJzb3IuY2ggKyAxIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dDYWxsb3V0UGlja2VyKGVkaXRvcjogYW55LCBjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgLy8gUmVtb3ZlIGFueSBleGlzdGluZyBwaWNrZXJcbiAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcignLm9uci1jYWxsb3V0LXBpY2tlcicpPy5yZW1vdmUoKTtcblxuICAgIGNvbnN0IHBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBpY2tlci5jbGFzc05hbWUgPSAnb25yLWNhbGxvdXQtcGlja2VyJztcbiAgICBPYmplY3QuYXNzaWduKHBpY2tlci5zdHlsZSwge1xuICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICBib3JkZXI6ICcxcHggc29saWQgI2M4YzZjNCcsXG4gICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxuICAgICAgYm94U2hhZG93OiAnMCA0cHggMTJweCByZ2JhKDAsMCwwLDAuMTUpJyxcbiAgICAgIHBhZGRpbmc6ICc0cHgnLFxuICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgZmxleFdyYXA6ICd3cmFwJyxcbiAgICAgIGdhcDogJzJweCcsXG4gICAgICBtYXhXaWR0aDogJzI2MHB4JyxcbiAgICAgIHpJbmRleDogJzEwMDAwJyxcbiAgICB9KTtcblxuICAgIENBTExPVVRfVFlQRVMuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgYnRuLnRleHRDb250ZW50ID0gdHlwZTtcbiAgICAgIE9iamVjdC5hc3NpZ24oYnRuLnN0eWxlLCB7XG4gICAgICAgIHBhZGRpbmc6ICczcHggOHB4JyxcbiAgICAgICAgZm9udFNpemU6ICcxMXB4JyxcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzNweCcsXG4gICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTFkZmRkJyxcbiAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICB9KTtcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gYnRuLnN0eWxlLmJhY2tncm91bmQgPSAnI2YwZWVlYycpO1xuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiBidG4uc3R5bGUuYmFja2dyb3VuZCA9ICcnKTtcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgcGlja2VyLnJlbW92ZSgpO1xuICAgICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoYD4gWyEke3R5cGV9XVxcbj4gYCwgY3Vyc29yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBwaWNrZXIuYXBwZW5kQ2hpbGQoYnRuKTtcbiAgICB9KTtcblxuICAgIC8vIFBvc2l0aW9uIGJlbG93IHRoZSBjYWxsb3V0IGJ1dHRvblxuICAgIGNvbnN0IGNhbGxvdXRCdG4gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignW2RhdGEtY21kPVwiaW5zZXJ0LWNhbGxvdXRcIl0nKSBhcyBIVE1MRWxlbWVudDtcbiAgICBpZiAoY2FsbG91dEJ0bikge1xuICAgICAgY29uc3QgcmVjdCA9IGNhbGxvdXRCdG4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBwaWNrZXIuc3R5bGUudG9wID0gYCR7cmVjdC5ib3R0b20gKyA0fXB4YDtcbiAgICAgIHBpY2tlci5zdHlsZS5sZWZ0ID0gYCR7cmVjdC5sZWZ0fXB4YDtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBpY2tlcik7XG5cbiAgICAvLyBDbG9zZSBvbiBvdXRzaWRlIGNsaWNrXG4gICAgY29uc3QgY2xvc2UgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgaWYgKCFwaWNrZXIuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSkpIHtcbiAgICAgICAgcGlja2VyLnJlbW92ZSgpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHNldFRpbWVvdXQoKCkgPT4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZSwgdHJ1ZSksIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBIb21lVGFiIH0gZnJvbSBcIi4uL3RhYnMvSG9tZVRhYlwiO1xuaW1wb3J0IHsgSW5zZXJ0VGFiIH0gZnJvbSBcIi4uL3RhYnMvSW5zZXJ0VGFiXCI7XG5cbmV4cG9ydCBjb25zdCBUQUJTID0gW1xuICBcIkhvbWVcIixcbiAgXCJJbnNlcnRcIixcbiAgXCJEcmF3XCIsXG4gIFwiSGlzdG9yeVwiLFxuICBcIlJldmlld1wiLFxuICBcIlZpZXdcIixcbiAgXCJIZWxwXCIsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgVGFiTmFtZSA9ICh0eXBlb2YgVEFCUylbbnVtYmVyXTtcblxuZXhwb3J0IGNsYXNzIFJpYmJvblNoZWxsIHtcbiAgcHJpdmF0ZSBlbDogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgYWN0aXZlVGFiOiBUYWJOYW1lID0gXCJIb21lXCI7XG4gIHByaXZhdGUgY29sbGFwc2VkID0gZmFsc2U7XG4gIHByaXZhdGUgcGlubmVkID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcDogQXBwKSB7fVxuXG4gIG1vdW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICAvLyBSZW1vdmUgYW55IGV4aXN0aW5nIHJpYmJvblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib25lbm90ZS1yaWJib24tcm9vdFwiKT8ucmVtb3ZlKCk7XG5cbiAgICB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0aGlzLmVsLmlkID0gXCJvbmVub3RlLXJpYmJvbi1yb290XCI7XG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWFjdGl2ZS10YWJcIiwgdGhpcy5hY3RpdmVUYWIpO1xuXG4gICAgdGhpcy5lbC5pbm5lckhUTUwgPSB0aGlzLmJ1aWxkSFRNTCgpO1xuICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XG5cbiAgICAvLyBSZW5kZXIgYWxsIHRhYiBwYW5lbHMgaW50byB0aGUgYm9keVxuICAgIGNvbnN0IGJvZHkgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoXCIub25yLWJvZHlcIikgYXMgSFRNTEVsZW1lbnQ7XG4gICAgbmV3IEhvbWVUYWIoKS5yZW5kZXIoYm9keSwgdGhpcy5hcHApO1xuICAgIG5ldyBJbnNlcnRUYWIoKS5yZW5kZXIoYm9keSwgdGhpcy5hcHApO1xuXG4gICAgLy8gU2hvdyBvbmx5IHRoZSBhY3RpdmUgdGFiIHBhbmVsXG4gICAgdGhpcy5zeW5jUGFuZWxWaXNpYmlsaXR5KGJvZHkpO1xuXG4gICAgLy8gSW5zZXJ0IGFib3ZlIHRoZSBtYWluIHdvcmtzcGFjZSByb3cgKGJlZm9yZSAuaG9yaXpvbnRhbC1tYWluLWNvbnRhaW5lciBpbnNpZGUgLmFwcC1jb250YWluZXIpXG4gICAgY29uc3QgaG1jID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ob3Jpem9udGFsLW1haW4tY29udGFpbmVyXCIpO1xuICAgIGhtYz8ucGFyZW50RWxlbWVudD8uaW5zZXJ0QmVmb3JlKHRoaXMuZWwsIGhtYyk7XG5cbiAgICAvLyBPZmZzZXQgYmVsb3cgdGhlIGZpeGVkIHRpdGxlYmFyIHNvIHRoZSB0YWIgYmFyIGlzbid0IGhpZGRlbiB1bmRlciBpdFxuICAgIGNvbnN0IHRpdGxlYmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50aXRsZWJhclwiKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKHRpdGxlYmFyKSB7XG4gICAgICBjb25zdCB0YkhlaWdodCA9IHRpdGxlYmFyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgIHRoaXMuZWwuc3R5bGUubWFyZ2luVG9wID0gYCR7dGJIZWlnaHR9cHhgO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVsO1xuICB9XG5cbiAgdW5tb3VudCgpIHtcbiAgICB0aGlzLmVsPy5yZW1vdmUoKTtcbiAgfVxuXG4gIHByaXZhdGUgc3luY1BhbmVsVmlzaWJpbGl0eShib2R5PzogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBib2R5ID8/ICh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoXCIub25yLWJvZHlcIikgYXMgSFRNTEVsZW1lbnQpO1xuICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLm9uci10YWItcGFuZWxcIikuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgKHAgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICBwLmdldEF0dHJpYnV0ZShcImRhdGEtcGFuZWxcIikgPT09IHRoaXMuYWN0aXZlVGFiID8gXCJcIiA6IFwibm9uZVwiO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEhUTUwoKTogc3RyaW5nIHtcbiAgICBjb25zdCB0YWJzID0gVEFCUy5tYXAoXG4gICAgICAodCkgPT5cbiAgICAgICAgYDxkaXYgY2xhc3M9XCJvbnItdGFiICR7dCA9PT0gdGhpcy5hY3RpdmVUYWIgPyBcImFjdGl2ZVwiIDogXCJcIn1cIiBkYXRhLXRhYj1cIiR7dH1cIj4ke3R9PC9kaXY+YCxcbiAgICApLmpvaW4oXCJcIik7XG5cbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm9uci10YWItYmFyXCI+XG4gICAgICAgICR7dGFic31cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1zcGFjZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9uci1waW4tYnRuXCI+JHt0aGlzLnBpbm5lZCA/IFwiXHVEODNEXHVEQ0NDXCIgOiBcIlwifSAke3RoaXMuY29sbGFwc2VkID8gXCJcdTI1QkMgRXhwYW5kXCIgOiBcIlx1MjVCMiBDb2xsYXBzZVwifTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwib25yLWJvZHlcIiBkYXRhLXRhYi1jb250ZW50PVwiSG9tZVwiPlxuICAgICAgICA8IS0tIHRhYiBjb250ZW50IGluamVjdGVkIGJ5IGVhY2ggdGFiIG1vZHVsZSAtLT5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaEV2ZW50cygpIHtcbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCIub25yLXRhYlwiKS5mb3JFYWNoKCh0YWIpID0+IHtcbiAgICAgIHRhYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IHRhYi5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRhYlwiKSBhcyBUYWJOYW1lO1xuICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZShcImRhdGEtYWN0aXZlLXRhYlwiLCB0aGlzLmFjdGl2ZVRhYik7XG4gICAgICAgIHRoaXMuZWxcbiAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5vbnItdGFiXCIpXG4gICAgICAgICAgLmZvckVhY2goKHQpID0+IHQuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKSk7XG4gICAgICAgIHRhYi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgICB0aGlzLnN5bmNQYW5lbFZpc2liaWxpdHkoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFwiLm9uci1waW4tYnRuXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5jb2xsYXBzZWQgPSAhdGhpcy5jb2xsYXBzZWQ7XG4gICAgICBjb25zdCBib2R5ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFwiLm9uci1ib2R5XCIpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgYm9keS5zdHlsZS5kaXNwbGF5ID0gdGhpcy5jb2xsYXBzZWQgPyBcIm5vbmVcIiA6IFwiXCI7XG4gICAgICAodGhpcy5lbC5xdWVyeVNlbGVjdG9yKFwiLm9uci1waW4tYnRuXCIpIGFzIEhUTUxFbGVtZW50KS50ZXh0Q29udGVudCA9IHRoaXNcbiAgICAgICAgLmNvbGxhcHNlZFxuICAgICAgICA/IFwiXHUyNUJDIEV4cGFuZFwiXG4gICAgICAgIDogXCJcdTI1QjIgQ29sbGFwc2VcIjtcbiAgICB9KTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQXVCOzs7QUNBdkIsc0JBQTRCO0FBNEI1QixJQUFNLFdBQXFCO0FBQUEsRUFDekI7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNiO0FBQ0Y7QUFFQSxJQUFNLGlCQUF5QyxDQUFDO0FBQ2hELFdBQVcsS0FBSztBQUFVLGlCQUFlLEVBQUUsR0FBRyxJQUFJO0FBV2xELElBQU0sY0FBMEI7QUFBQSxFQUM5QixFQUFFLE9BQU8sYUFBYSxPQUFPLHNFQUFzRSxRQUFRLEtBQUs7QUFBQSxFQUNoSCxFQUFFLE9BQU8sYUFBYSxPQUFPLGdEQUFnRCxRQUFRLE1BQU07QUFBQSxFQUMzRixFQUFFLE9BQU8sYUFBYSxPQUFPLGdEQUFnRCxRQUFRLE9BQU87QUFBQSxFQUM1RixFQUFFLE9BQU8sYUFBYSxPQUFPLGtFQUFrRSxRQUFRLFFBQVE7QUFBQSxFQUMvRyxFQUFFLE9BQU8sYUFBYSxPQUFPLGdEQUFnRCxRQUFRLFNBQVM7QUFBQSxFQUM5RixFQUFFLE9BQU8sYUFBYSxPQUFPLGtEQUFrRCxRQUFRLFVBQVU7QUFBQSxFQUNqRyxFQUFFLE9BQU8sY0FBYyxPQUFPLDZDQUE2QyxRQUFRLEtBQUs7QUFBQSxFQUN4RixFQUFFLE9BQU8sWUFBWSxPQUFPLCtDQUErQyxRQUFRLEtBQUs7QUFBQSxFQUN4RixFQUFFLE9BQU8sU0FBUyxPQUFPLCtDQUErQyxRQUFRLEtBQUs7QUFBQSxFQUNyRixFQUFFLE9BQU8sUUFBUSxPQUFPLG9GQUFvRixRQUFRLFNBQVMsUUFBUSxRQUFRO0FBQUEsRUFDN0ksRUFBRSxPQUFPLFVBQVUsT0FBTyxnQ0FBZ0MsUUFBUSxHQUFHO0FBQ3ZFO0FBR0EsU0FBUyxZQUFZLEtBQXFCO0FBQ3hDLFFBQU0sTUFBOEI7QUFBQSxJQUNsQyxZQUFZO0FBQUEsSUFDWixlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixpQkFBaUI7QUFBQSxJQUNqQixnQkFBZ0I7QUFBQSxJQUNoQixnQkFBZ0I7QUFBQSxJQUNoQixrQkFBa0I7QUFBQSxJQUNsQixpQkFBaUI7QUFBQSxJQUNqQixlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsSUFDZixZQUFZO0FBQUEsSUFDWixnQkFBZ0I7QUFBQSxJQUNoQixnQkFBZ0I7QUFBQSxJQUNoQixpQkFBaUI7QUFBQSxJQUNqQixpQkFBaUI7QUFBQSxJQUNqQixhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQUEsSUFDYixjQUFjO0FBQUEsSUFDZCxZQUFZO0FBQUEsSUFDWixpQkFBaUI7QUFBQSxJQUNqQixpQkFBaUI7QUFBQSxJQUNqQixtQkFBbUI7QUFBQSxJQUNuQixhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsSUFDZixZQUFZO0FBQUEsRUFDZDtBQUNBLFNBQU8sSUFBSSxHQUFHLEtBQUs7QUFDckI7QUFJQSxTQUFTLGFBQWEsUUFBcUIsT0FBdUIsTUFBMkI7QUFFM0YsV0FDRyxpQkFBaUIsdUJBQXVCLEVBQ3hDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBRTlCLFFBQU0sT0FBTyxTQUFTLGNBQWMsS0FBSztBQUN6QyxPQUFLLFlBQVk7QUFFakIsUUFBTSxTQUFTLE1BQU0sTUFBTTtBQUMzQixRQUFNLFVBQVUsTUFBTSxXQUFXO0FBQ2pDLFFBQU0sWUFBWSxNQUFNLFNBQVM7QUFHakMsUUFBTSxjQUFjLE1BQU0sU0FBUztBQUNuQyxTQUFPLE9BQU8sS0FBSyxPQUFPO0FBQUEsSUFDeEIsVUFBVTtBQUFBLElBQ1YsWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsR0FBSSxjQUFjLEVBQUUsV0FBVyxTQUFTLFdBQVcsT0FBTyxJQUFJLENBQUM7QUFBQSxFQUNqRSxDQUFDO0FBRUQsYUFBVyxRQUFRLE9BQU87QUFDeEIsUUFBSSxLQUFLLFNBQVM7QUFDaEIsWUFBTSxNQUFNLFNBQVMsY0FBYyxLQUFLO0FBQ3hDLGFBQU8sT0FBTyxJQUFJLE9BQU87QUFBQSxRQUN2QixXQUFXO0FBQUEsUUFDWCxRQUFRO0FBQUEsTUFDVixDQUFDO0FBQ0QsV0FBSyxZQUFZLEdBQUc7QUFDcEI7QUFBQSxJQUNGO0FBQ0EsVUFBTSxNQUFNLFNBQVMsY0FBYyxLQUFLO0FBQ3hDLFFBQUksWUFBWTtBQUNoQixXQUFPLE9BQU8sSUFBSSxPQUFPO0FBQUEsTUFDdkIsU0FBUztBQUFBLE1BQ1QsUUFBUSxLQUFLLFdBQVcsWUFBWTtBQUFBLE1BQ3BDLE9BQU8sS0FBSyxXQUFXLFlBQVk7QUFBQSxNQUNuQyxTQUFTO0FBQUEsTUFDVCxZQUFZO0FBQUEsTUFDWixLQUFLO0FBQUEsTUFDTCxZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQ0QsUUFBSSxLQUFLO0FBQ1AsVUFBSSxhQUFhLFNBQVMsSUFBSSxhQUFhLE9BQU8sSUFBSSxNQUFNLEtBQUssS0FBSztBQUN4RSxRQUFJLGNBQWMsS0FBSztBQUN2QixRQUFJLEtBQUssVUFBVTtBQUNqQixZQUFNLE1BQU0sU0FBUyxjQUFjLE1BQU07QUFDekMsVUFBSSxjQUFjLEtBQUs7QUFDdkIsVUFBSSxNQUFNLFVBQ1I7QUFDRixVQUFJLFlBQVksR0FBRztBQUFBLElBQ3JCO0FBQ0EsUUFBSSxDQUFDLEtBQUssVUFBVTtBQUNsQixVQUFJLGlCQUFpQixjQUFjLE1BQU07QUFDdkMsWUFBSSxNQUFNLGFBQWE7QUFBQSxNQUN6QixDQUFDO0FBQ0QsVUFBSSxpQkFBaUIsY0FBYyxNQUFNO0FBQ3ZDLFlBQUksTUFBTSxhQUFhO0FBQUEsTUFDekIsQ0FBQztBQUNELFVBQUksaUJBQWlCLGFBQWEsQ0FBQyxNQUFNO0FBQ3ZDLFVBQUUsZUFBZTtBQUFBLE1BQ25CLENBQUM7QUFDRCxVQUFJLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNuQyxVQUFFLGdCQUFnQjtBQUNsQixhQUFLLE9BQU87QUFDWixhQUFLLE9BQU87QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNIO0FBQ0EsU0FBSyxZQUFZLEdBQUc7QUFBQSxFQUN0QjtBQUVBLFdBQVMsS0FBSyxZQUFZLElBQUk7QUFHOUIsUUFBTSxPQUFPLE9BQU8sc0JBQXNCO0FBQzFDLE1BQUksTUFBTSxLQUFLLFNBQVM7QUFDeEIsTUFBSSxPQUFPLEtBQUs7QUFHaEIsUUFBTSxLQUFLLGNBQWMsTUFBTSxLQUFLLGdCQUFnQjtBQUNwRCxNQUFJLE1BQU0sS0FBSyxPQUFPO0FBQWEsVUFBTSxLQUFLLE1BQU0sS0FBSztBQUN6RCxNQUFJLE9BQU8sTUFBTSxPQUFPO0FBQVksV0FBTyxPQUFPLGFBQWE7QUFFL0QsT0FBSyxNQUFNLE1BQU0sTUFBTTtBQUN2QixPQUFLLE1BQU0sT0FBTyxPQUFPO0FBR3pCLFFBQU0sUUFBUSxDQUFDLE1BQWtCO0FBQy9CLFFBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRSxNQUFjLEdBQUc7QUFDcEMsV0FBSyxPQUFPO0FBQ1osZUFBUyxvQkFBb0IsU0FBUyxPQUFPLElBQUk7QUFBQSxJQUNuRDtBQUFBLEVBQ0Y7QUFDQSxhQUFXLE1BQU0sU0FBUyxpQkFBaUIsU0FBUyxPQUFPLElBQUksR0FBRyxDQUFDO0FBQ3JFO0FBSUEsU0FBUyxpQkFBaUIsUUFBcUIsS0FBZ0I7QUFDN0QsUUFBTSxTQUFTLElBQUksVUFBVSxjQUFjO0FBRTNDLFdBQ0csaUJBQWlCLHVCQUF1QixFQUN4QyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUM5QixRQUFNLE9BQU8sU0FBUyxjQUFjLEtBQUs7QUFDekMsT0FBSyxZQUFZO0FBQ2pCLFNBQU8sT0FBTyxLQUFLLE9BQU87QUFBQSxJQUN4QixVQUFVO0FBQUEsSUFDVixZQUFZO0FBQUEsSUFDWixRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxZQUFZO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsRUFDYixDQUFDO0FBRUQsYUFBVyxPQUFPLFVBQVU7QUFDMUIsVUFBTSxNQUFNLFNBQVMsY0FBYyxLQUFLO0FBQ3hDLFFBQUksWUFBWTtBQUNoQixXQUFPLE9BQU8sSUFBSSxPQUFPO0FBQUEsTUFDdkIsU0FBUztBQUFBLE1BQ1QsUUFBUTtBQUFBLE1BQ1IsT0FBTztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsWUFBWTtBQUFBLE1BQ1osS0FBSztBQUFBLElBQ1AsQ0FBQztBQUVELFVBQU0sU0FBUyxTQUFTLGNBQWMsTUFBTTtBQUM1QyxXQUFPLGNBQWMsSUFBSTtBQUN6QixXQUFPLE1BQU0sVUFBVSx1SUFBdUksSUFBSSxTQUFTO0FBRTNLLFVBQU0sVUFBVSxTQUFTLGNBQWMsTUFBTTtBQUM3QyxZQUFRLGNBQWMsSUFBSTtBQUMxQixZQUFRLE1BQU0sVUFBVTtBQUd4QixVQUFNLFFBQVEsU0FBUyxjQUFjLEtBQUs7QUFDMUMsVUFBTSxNQUFNLFVBQ1Y7QUFHRixRQUFJLFFBQVE7QUFDVixZQUFNLFdBQVcsT0FBTyxRQUFRLE9BQU8sVUFBVSxFQUFFLElBQUk7QUFDdkQsWUFBTSxXQUFXLFlBQVksSUFBSSxHQUFHO0FBQ3BDLFVBQUksWUFBWSxTQUFTLFNBQVMsU0FBUyxNQUFNLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUc7QUFDakUsY0FBTSxNQUFNLGFBQWE7QUFDekIsY0FBTSxZQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0Y7QUFFQSxRQUFJLFlBQVksTUFBTTtBQUN0QixRQUFJLFlBQVksT0FBTztBQUN2QixRQUFJLFlBQVksS0FBSztBQUVyQixRQUFJLGlCQUFpQixjQUFjLE1BQU07QUFDdkMsVUFBSSxNQUFNLGFBQWE7QUFBQSxJQUN6QixDQUFDO0FBQ0QsUUFBSSxpQkFBaUIsY0FBYyxNQUFNO0FBQ3ZDLFVBQUksTUFBTSxhQUFhO0FBQUEsSUFDekIsQ0FBQztBQUNELFFBQUksaUJBQWlCLGFBQWEsQ0FBQyxNQUFNO0FBQ3ZDLFFBQUUsZUFBZTtBQUFBLElBQ25CLENBQUM7QUFDRCxRQUFJLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNuQyxRQUFFLGdCQUFnQjtBQUNsQixXQUFLLE9BQU87QUFDWixVQUFJO0FBQVEsaUJBQVMsSUFBSSxLQUFLLE1BQU07QUFBQSxJQUN0QyxDQUFDO0FBRUQsU0FBSyxZQUFZLEdBQUc7QUFBQSxFQUN0QjtBQUdBLFFBQU0sTUFBTSxTQUFTLGNBQWMsS0FBSztBQUN4QyxNQUFJLE1BQU0sVUFBVTtBQUNwQixPQUFLLFlBQVksR0FBRztBQUVwQixRQUFNLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDOUMsWUFBVSxNQUFNLFVBQ2Q7QUFDRixZQUFVLFlBQ1I7QUFDRixZQUFVLGlCQUFpQixTQUFTLE1BQU07QUFDeEMsU0FBSyxPQUFPO0FBQ1osUUFBSSx1QkFBTyx1Q0FBdUM7QUFBQSxFQUNwRCxDQUFDO0FBQ0QsT0FBSyxZQUFZLFNBQVM7QUFFMUIsV0FBUyxLQUFLLFlBQVksSUFBSTtBQUU5QixRQUFNLE9BQU8sT0FBTyxzQkFBc0I7QUFDMUMsTUFBSSxNQUFNLEtBQUssU0FBUztBQUN4QixNQUFJLE9BQU8sS0FBSztBQUNoQixNQUFJLE1BQU0sTUFBTSxPQUFPO0FBQ3JCLFVBQU0sS0FBSyxJQUFJLEdBQUcsT0FBTyxjQUFjLEdBQUc7QUFDNUMsTUFBSSxPQUFPLE1BQU0sT0FBTztBQUFZLFdBQU8sT0FBTyxhQUFhO0FBQy9ELE9BQUssTUFBTSxNQUFNLE1BQU07QUFDdkIsT0FBSyxNQUFNLE9BQU8sT0FBTztBQUV6QixRQUFNLFFBQVEsQ0FBQyxNQUFrQjtBQUMvQixRQUFJLENBQUMsS0FBSyxTQUFTLEVBQUUsTUFBYyxHQUFHO0FBQ3BDLFdBQUssT0FBTztBQUNaLGVBQVMsb0JBQW9CLFNBQVMsT0FBTyxJQUFJO0FBQUEsSUFDbkQ7QUFBQSxFQUNGO0FBQ0EsYUFBVyxNQUFNLFNBQVMsaUJBQWlCLFNBQVMsT0FBTyxJQUFJLEdBQUcsQ0FBQztBQUNyRTtBQUlBLFNBQVMsU0FBUyxLQUFhLFFBQW1CO0FBQ2hELFFBQU0sV0FBVyxZQUFZLEdBQUc7QUFDaEMsTUFBSSxDQUFDO0FBQVU7QUFFZixNQUFJLFFBQVEsaUJBQWlCO0FBQzNCLGlCQUFhLFFBQVEsSUFBSTtBQUN6QjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLFFBQU0sT0FBTyxPQUFPLFFBQVEsT0FBTyxJQUFJO0FBQ3ZDLFFBQU0sWUFBWSxTQUFTLE1BQU0sSUFBSSxFQUFFLENBQUM7QUFFeEMsTUFBSSxLQUFLLFdBQVcsU0FBUyxHQUFHO0FBRTlCLFVBQU0sZ0JBQWdCLFNBQVMsTUFBTSxJQUFJO0FBQ3pDLFFBQUksY0FBYyxTQUFTLEdBQUc7QUFFNUIsYUFBTztBQUFBLFFBQ0w7QUFBQSxRQUNBLEVBQUUsTUFBTSxPQUFPLE1BQU0sSUFBSSxFQUFFO0FBQUEsUUFDM0IsRUFBRSxNQUFNLE9BQU8sT0FBTyxHQUFHLElBQUksRUFBRTtBQUFBLE1BQ2pDO0FBQ0EsWUFBTSxhQUFhLGNBQWMsQ0FBQztBQUNsQyxVQUFJLFlBQVk7QUFDZCxjQUFNLFVBQVUsT0FBTyxRQUFRLE9BQU8sSUFBSTtBQUMxQyxZQUFJLFlBQVksVUFBYSxRQUFRLFdBQVcsVUFBVSxHQUFHO0FBQzNELGlCQUFPLFFBQVEsT0FBTyxNQUFNLFFBQVEsTUFBTSxXQUFXLE1BQU0sQ0FBQztBQUFBLFFBQzlEO0FBQUEsTUFDRjtBQUFBLElBQ0YsT0FBTztBQUNMLGFBQU8sUUFBUSxPQUFPLE1BQU0sS0FBSyxNQUFNLFVBQVUsTUFBTSxDQUFDO0FBQUEsSUFDMUQ7QUFBQSxFQUNGLFdBQ0UsUUFBUSxjQUNSLFFBQVEsaUJBQ1IsUUFBUSxlQUNSO0FBQ0EscUJBQWlCLFFBQVEsU0FBUztBQUFBLEVBQ3BDLE9BQU87QUFDTCxXQUFPLGFBQWEsVUFBVSxNQUFNO0FBQUEsRUFDdEM7QUFDRjtBQUlBLFNBQVMsYUFBYSxRQUFhLE1BQWMsT0FBc0I7QUFDckUsUUFBTSxLQUFLLFNBQVM7QUFDcEIsUUFBTSxNQUFNLE9BQU8sYUFBYTtBQUNoQyxNQUFJLEtBQUs7QUFDUCxRQUFJLElBQUksV0FBVyxJQUFJLEtBQUssSUFBSSxTQUFTLEVBQUUsR0FBRztBQUM1QyxhQUFPLGlCQUFpQixJQUFJLE1BQU0sS0FBSyxRQUFRLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUFBLElBQ3hFLE9BQU87QUFDTCxhQUFPLGlCQUFpQixHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsRUFBRSxFQUFFO0FBQUEsSUFDOUM7QUFBQSxFQUNGLE9BQU87QUFDTCxVQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLFdBQU8sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLElBQUksTUFBTTtBQUMxQyxXQUFPLFVBQVUsRUFBRSxNQUFNLE9BQU8sTUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLE9BQU8sQ0FBQztBQUFBLEVBQ3JFO0FBQ0Y7QUFJQSxTQUFTLGlCQUFpQixRQUFhLFFBQXNCO0FBQzNELFFBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsUUFBTSxPQUFPLE9BQU8sUUFBUSxPQUFPLElBQUk7QUFHdkMsTUFBSSxZQUFZLEtBQUssV0FBVyxNQUFNO0FBQ3RDLE1BQUkscUJBQXFCLE9BQU87QUFDaEMsTUFBSSxDQUFDLGFBQWEsT0FBTyxXQUFXLFFBQVEsR0FBRztBQUM3QyxVQUFNLE9BQU8sT0FBTyxNQUFNLFNBQVMsTUFBTTtBQUN6QyxlQUFXLEtBQUssQ0FBQyxVQUFVLFVBQVUsYUFBUSxHQUFHO0FBQzlDLFVBQUksS0FBSyxXQUFXLElBQUksSUFBSSxHQUFHO0FBQzdCLG9CQUFZO0FBQ1osOEJBQXNCLElBQUksTUFBTTtBQUNoQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLE1BQUksV0FBVztBQUNiLFdBQU8sUUFBUSxPQUFPLE1BQU0sS0FBSyxNQUFNLGtCQUFrQixDQUFDO0FBQUEsRUFDNUQsT0FBTztBQUNMLFVBQU0sV0FBVyxLQUFLO0FBQUEsTUFDcEI7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUNBLFdBQU8sUUFBUSxPQUFPLE1BQU0sU0FBUyxRQUFRO0FBQUEsRUFDL0M7QUFDRjtBQUlPLElBQU0sVUFBTixNQUFjO0FBQUEsRUFBZDtBQUNMLFNBQVEsZUFBZTtBQUFBO0FBQUEsRUFFdkIsT0FBTyxXQUF3QixLQUFnQjtBQUM3QyxVQUFNLFFBQVEsU0FBUyxjQUFjLEtBQUs7QUFDMUMsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sYUFBYSxjQUFjLE1BQU07QUFDdkMsVUFBTSxZQUFZLEtBQUssVUFBVTtBQUNqQyxTQUFLLGFBQWEsT0FBTyxHQUFHO0FBQzVCLGNBQVUsWUFBWSxLQUFLO0FBQUEsRUFDN0I7QUFBQSxFQUVRLFlBQW9CO0FBQzFCLFdBQU87QUFBQSxRQUNILEtBQUssbUJBQW1CLENBQUM7QUFBQSxRQUN6QixLQUFLLG1CQUFtQixDQUFDO0FBQUEsUUFDekIsS0FBSyxnQkFBZ0IsQ0FBQztBQUFBLFFBQ3RCLEtBQUssY0FBYyxDQUFDO0FBQUEsUUFDcEIsS0FBSyxlQUFlLENBQUM7QUFBQSxRQUNyQixLQUFLLGtCQUFrQixDQUFDO0FBQUE7QUFBQSxFQUU5QjtBQUFBO0FBQUEsRUFHUSxxQkFBNkI7QUFDbkMsV0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUE2QlQ7QUFBQTtBQUFBLEVBR1EscUJBQTZCO0FBQ25DLFdBQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWdFVDtBQUFBO0FBQUEsRUFHUSxrQkFBMEI7QUFDaEMsVUFBTSxLQUFLLFlBQVksQ0FBQztBQUN4QixVQUFNLEtBQUssWUFBWSxDQUFDO0FBQ3hCLFdBQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUt1QyxHQUFHLEtBQUssS0FBSyxHQUFHLEtBQUs7QUFBQTtBQUFBO0FBQUEsa0RBR3JCLEdBQUcsS0FBSyxLQUFLLEdBQUcsS0FBSztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFXckU7QUFBQTtBQUFBLEVBR1EsZ0JBQXdCO0FBQzlCLFVBQU0sT0FBTyxTQUFTLE1BQU0sR0FBRyxDQUFDO0FBQ2hDLFVBQU0sT0FBTyxLQUNWO0FBQUEsTUFDQyxDQUFDLFFBQVE7QUFBQSxzREFDcUMsSUFBSSxHQUFHO0FBQUEsMEpBQzZGLElBQUksU0FBUyxLQUFLLElBQUksSUFBSTtBQUFBLHdFQUM1RyxJQUFJLEtBQUs7QUFBQTtBQUFBO0FBQUEsSUFHM0UsRUFDQyxLQUFLLEVBQUU7QUFFVixXQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FJRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFnQmhCO0FBQUE7QUFBQSxFQUdRLGlCQUF5QjtBQUMvQixXQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWNUO0FBQUE7QUFBQSxFQUdRLG9CQUE0QjtBQUNsQyxXQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBa0JUO0FBQUE7QUFBQSxFQUdRLGFBQWEsV0FBd0IsS0FBZ0I7QUFDM0QsY0FBVSxpQkFBaUIsWUFBWSxFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQ3ZELFNBQUcsaUJBQWlCLGFBQWEsQ0FBQyxNQUFNO0FBQ3RDLFVBQUUsZUFBZTtBQUNqQixVQUFFLGdCQUFnQjtBQUFBLE1BQ3BCLENBQUM7QUFDRCxTQUFHLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNsQyxVQUFFLGdCQUFnQjtBQUNsQixhQUFLO0FBQUEsVUFDSCxHQUFHLGFBQWEsVUFBVTtBQUFBLFVBQzFCO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBS0QsVUFBTSxtQkFBbUIsTUFBTTtBQUM3Qiw0QkFBc0IsTUFBTSxLQUFLLGtCQUFrQixXQUFXLEdBQUcsQ0FBQztBQUFBLElBQ3BFO0FBQ0EsVUFBTSxjQUNKLFNBQVMsY0FBYyxZQUFZLEtBQUssU0FBUztBQUNuRCxnQkFBWSxpQkFBaUIsU0FBUyxrQkFBa0IsSUFBSTtBQUM1RCxnQkFBWSxpQkFBaUIsU0FBUyxrQkFBa0IsSUFBSTtBQUc1RCxnQkFBWSxpQkFBaUIsV0FBVyxDQUFDLE1BQU07QUFDN0MsVUFBSSxDQUFFLE9BQWU7QUFBYztBQUVuQyxVQUFLLEVBQUUsUUFBb0IsUUFBUSxZQUFZO0FBQUc7QUFDbEQsNEJBQXNCLE1BQU07QUFDMUIsY0FBTSxLQUFLLElBQUksVUFBVSxjQUFjO0FBQ3ZDLGNBQU0sS0FBTSxPQUFlO0FBSTNCLGNBQU0sTUFBTSxJQUFJLGFBQWE7QUFHN0IsUUFBQyxPQUFlLGVBQWU7QUFDL0IsUUFBQyxPQUFlLFNBQVM7QUFDekIsY0FBTSxRQUNKLFVBQVUsY0FBYyw2QkFBK0IsS0FDdkQsU0FBUyxjQUFjLGlEQUFpRDtBQUUxRSxZQUFJO0FBQU8sZ0JBQU0sVUFBVSxPQUFPLFlBQVk7QUFFOUMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFBSztBQUV4QixZQUFJLFNBQVM7QUFDYixZQUFJLEdBQUc7QUFBYSxtQkFBUyxNQUFNLE1BQU07QUFDekMsWUFBSSxHQUFHO0FBQVUsbUJBQVMsSUFBSSxNQUFNO0FBQ3BDLFlBQUksR0FBRztBQUFRLG1CQUFTLEtBQUssTUFBTTtBQUNuQyxXQUFHLGlCQUFpQixNQUFNO0FBQzFCLFlBQUksR0FBRyxZQUFZO0FBQ2pCLGdCQUFNLElBQUksR0FBRyxVQUFVO0FBQ3ZCLGdCQUFNLElBQUksR0FBRyxRQUFRLEVBQUUsSUFBSTtBQUMzQixjQUFJLENBQUMsRUFBRSxXQUFXLEdBQUcsVUFBVSxHQUFHO0FBQ2hDLGVBQUcsUUFBUSxFQUFFLE1BQU0sR0FBRyxhQUFhLEVBQUUsUUFBUSxjQUFjLEVBQUUsQ0FBQztBQUFBLFVBQ2hFO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsR0FBRyxJQUFJO0FBR1AsUUFBSSxVQUFVLEdBQUcsc0JBQXNCLE1BQU07QUFDM0MsaUJBQVcsTUFBTSxLQUFLLGtCQUFrQixXQUFXLEdBQUcsR0FBRyxHQUFHO0FBQUEsSUFDOUQsQ0FBQztBQUNELFFBQUksVUFBVSxHQUFHLGlCQUFpQixNQUFNO0FBQ3RDLDRCQUFzQixNQUFNLEtBQUssa0JBQWtCLFdBQVcsR0FBRyxDQUFDO0FBQUEsSUFDcEUsQ0FBQztBQUVELGVBQVcsTUFBTSxLQUFLLGtCQUFrQixXQUFXLEdBQUcsR0FBRyxHQUFHO0FBQUEsRUFDOUQ7QUFBQTtBQUFBLEVBR1Esa0JBQWtCLE9BQW9CLEtBQWdCO0FBQzVELFVBQU0sU0FBUyxJQUFJLFVBQVUsY0FBYztBQUMzQyxRQUFJLENBQUM7QUFBUTtBQUViLFVBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsVUFBTSxPQUFPLE9BQU8sUUFBUSxPQUFPLElBQUk7QUFHdkMsVUFBTSxZQUFZLEtBQUssTUFBTSxhQUFhO0FBQzFDLFVBQU0sWUFBWSxZQUFZLFVBQVUsQ0FBQyxFQUFFLFNBQVM7QUFHcEQsUUFBSSxhQUFhLEtBQUssYUFBYSxHQUFHO0FBQ3BDLFlBQU0sWUFBWSxLQUFLO0FBQUEsUUFDckI7QUFBQSxRQUNBLEtBQUssSUFBSSxZQUFZLEdBQUcsWUFBWSxTQUFTLENBQUM7QUFBQSxNQUNoRDtBQUNBLFVBQUksY0FBYyxLQUFLLGNBQWM7QUFDbkMsYUFBSyxlQUFlO0FBQ3BCLGFBQUssb0JBQW9CLEtBQUs7QUFBQSxNQUNoQztBQUFBLElBQ0Y7QUFHQSxVQUFNLFlBQVksQ0FBQyxLQUFhLFdBQW9CO0FBQ2xELFlBQU0sTUFBTSxNQUFNLGNBQWMsY0FBYyxHQUFHLElBQUk7QUFDckQsVUFBSTtBQUFLLFlBQUksVUFBVSxPQUFPLGNBQWMsTUFBTTtBQUFBLElBQ3BEO0FBR0EsVUFBTSxZQUFZLEtBQUssUUFBUSxZQUFZLEVBQUU7QUFHN0MsY0FBVSxRQUFRLGdCQUFnQixLQUFLLFNBQVMsQ0FBQztBQUNqRCxjQUFVLFVBQVUsK0JBQStCLEtBQUssU0FBUyxDQUFDO0FBQ2xFLGNBQVUsYUFBYSxNQUFNLEtBQUssSUFBSSxDQUFDO0FBQ3ZDLGNBQVUsaUJBQWlCLFlBQVksS0FBSyxTQUFTLENBQUM7QUFDdEQsY0FBVSxhQUFhLFlBQVksS0FBSyxTQUFTLENBQUM7QUFFbEQsVUFBTSxLQUFLLE9BQU87QUFDbEIsVUFBTSxXQUFXLE1BQU07QUFBRSxVQUFJLElBQUk7QUFBRyxhQUFPLElBQUksS0FBSyxRQUFRO0FBQUUsY0FBTSxJQUFJLEtBQUssUUFBUSxTQUFTLENBQUM7QUFBRyxZQUFJLElBQUk7QUFBRztBQUFPLGNBQU0sS0FBSyxLQUFLLFFBQVEsVUFBVSxDQUFDO0FBQUcsWUFBSSxLQUFLO0FBQUc7QUFBTyxZQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSztBQUFHLGlCQUFPO0FBQU0sWUFBSSxLQUFLO0FBQUEsTUFBRztBQUFFLGFBQU87QUFBQSxJQUFPLEdBQUc7QUFDeFAsVUFBTSxXQUFXLE1BQU07QUFBRSxVQUFJLElBQUk7QUFBRyxhQUFPLElBQUksS0FBSyxRQUFRO0FBQUUsY0FBTSxJQUFJLEtBQUssUUFBUSxTQUFTLENBQUM7QUFBRyxZQUFJLElBQUk7QUFBRztBQUFPLGNBQU0sS0FBSyxLQUFLLFFBQVEsVUFBVSxDQUFDO0FBQUcsWUFBSSxLQUFLO0FBQUc7QUFBTyxZQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSztBQUFHLGlCQUFPO0FBQU0sWUFBSSxLQUFLO0FBQUEsTUFBRztBQUFFLGFBQU87QUFBQSxJQUFPLEdBQUc7QUFDeFAsY0FBVSxhQUFhLE9BQU87QUFDOUIsY0FBVSxlQUFlLE9BQU87QUFHaEMsY0FBVSxlQUFlLFdBQVcsS0FBSyxJQUFJLENBQUM7QUFDOUMsY0FBVSxpQkFBaUIsZUFBZSxLQUFLLElBQUksQ0FBQztBQUdwRCxLQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNO0FBQ3BCLFlBQU0sT0FBTyxNQUFNO0FBQUEsUUFDakIsNkJBQTZCLENBQUM7QUFBQSxNQUNoQztBQUNBLFVBQUksQ0FBQztBQUFNO0FBQ1gsWUFBTSxJQUFJLFlBQVksS0FBSyxlQUFlLENBQUM7QUFDM0MsVUFBSSxDQUFDLEdBQUc7QUFBRSxhQUFLLFVBQVUsT0FBTyxZQUFZO0FBQUc7QUFBQSxNQUFRO0FBQ3ZELFlBQU0sV0FDSCxZQUFZLEtBQUssRUFBRSxXQUFXLElBQUksT0FBTyxTQUFTLElBQUksT0FDdEQsY0FBYyxLQUFLLEVBQUUsVUFBVTtBQUNsQyxXQUFLLFVBQVUsT0FBTyxjQUFjLFFBQVE7QUFBQSxJQUM5QyxDQUFDO0FBR0QsVUFBTSxZQUFZLE1BQU0sY0FBYyxpQkFBaUI7QUFDdkQsUUFBSSxXQUFXO0FBQ2IsWUFBTSxJQUFLLElBQUksTUFBYyxZQUFZLFVBQVU7QUFDbkQsVUFBSTtBQUFHLGtCQUFVLGNBQWM7QUFBQSxJQUNqQztBQUNBLFVBQU0sWUFBWSxNQUFNLGNBQWMsaUJBQWlCO0FBQ3ZELFFBQUksV0FBVztBQUNiLFlBQU0sSUFBSyxJQUFJLE1BQWMsWUFBWSxjQUFjO0FBQ3ZELFVBQUk7QUFBRyxrQkFBVSxjQUFjLE9BQU8sQ0FBQztBQUFBLElBQ3pDO0FBR0EsU0FBSyxpQkFBaUIsTUFBTTtBQUFBLEVBQzlCO0FBQUE7QUFBQSxFQUdRLG9CQUFvQixPQUEwQjtBQUNwRCxLQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNO0FBQ3BCLFlBQU0sT0FBTyxNQUFNO0FBQUEsUUFDakIsNkJBQTZCLENBQUM7QUFBQSxNQUNoQztBQUNBLFVBQUksQ0FBQztBQUFNO0FBQ1gsWUFBTSxPQUFPLFlBQVksS0FBSyxlQUFlLENBQUM7QUFDOUMsVUFBSSxDQUFDLE1BQU07QUFDVCxhQUFLLE1BQU0sVUFBVTtBQUNyQjtBQUFBLE1BQ0Y7QUFDQSxXQUFLLE1BQU0sVUFBVTtBQUNyQixZQUFNLE9BQU8sS0FBSyxjQUFjLE1BQU07QUFDdEMsVUFBSSxNQUFNO0FBQ1IsYUFBSyxjQUFjLEtBQUs7QUFDeEIsYUFBSyxNQUFNLFVBQVUsS0FBSztBQUFBLE1BQzVCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRVEsZUFDTixLQUNBLEtBQ0EsUUFDQSxPQUNNO0FBQ04sUUFBSSxDQUFDO0FBQUs7QUFDVixVQUFNLFNBQVMsSUFBSSxVQUFVLGNBQWM7QUFDM0MsVUFBTSxPQUFPLENBQUMsT0FBZSxJQUFJLFNBQVMsbUJBQW1CLEVBQUU7QUFFL0QsWUFBUSxLQUFLO0FBQUEsTUFFWCxLQUFLLFNBQVM7QUFDWixZQUFJLFFBQVE7QUFDVixvQkFBVSxVQUNQLFNBQVMsRUFDVCxLQUFLLENBQUMsU0FBUztBQUNkLG1CQUFPLGlCQUFpQixJQUFJO0FBQUEsVUFDOUIsQ0FBQyxFQUNBLE1BQU0sTUFBTTtBQUVYLGtCQUFNLEtBQ0gsT0FBZSxJQUFJLE9BQ3BCLFNBQVMsY0FBYyxhQUFhO0FBQ3RDLGdCQUFJLElBQUk7QUFDTixpQkFBRyxNQUFNO0FBQ1QsdUJBQVMsWUFBWSxPQUFPO0FBQUEsWUFDOUI7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNMO0FBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLLGtCQUFrQjtBQUNyQixZQUFJLENBQUM7QUFBUTtBQUNiLHFCQUFhLFFBQVE7QUFBQSxVQUNuQjtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsVUFBVTtBQUFBLFlBQ1YsUUFBUSxNQUFNO0FBQ1osa0JBQUk7QUFDRiwwQkFBVSxVQUNQLFNBQVMsRUFDVCxLQUFLLENBQUMsTUFBTSxPQUFPLGlCQUFpQixDQUFDLENBQUM7QUFBQSxZQUM3QztBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxPQUFPO0FBQUEsWUFDUCxVQUFVO0FBQUEsWUFDVixRQUFRLE1BQU07QUFDWixrQkFBSTtBQUNGLDBCQUFVLFVBQVUsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNO0FBRXpDLHdCQUFNLFFBQVEsRUFDWCxRQUFRLFlBQVksRUFBRSxFQUN0QixRQUFRLFNBQVMsSUFBSTtBQUN4Qix5QkFBTyxpQkFBaUIsS0FBSztBQUFBLGdCQUMvQixDQUFDO0FBQUEsWUFDTDtBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxPQUFPO0FBQUEsWUFDUCxVQUFVO0FBQUEsWUFDVixRQUFRLE1BQU07QUFBQSxZQUFDO0FBQUEsVUFDakI7QUFBQSxRQUNGLENBQUM7QUFDRDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUssT0FBTztBQUNWLFlBQUksUUFBUTtBQUNWLGdCQUFNLE1BQU0sT0FBTyxhQUFhO0FBQ2hDLGNBQUksS0FBSztBQUNQLHNCQUFVLFVBQ1AsVUFBVSxHQUFHLEVBQ2IsS0FBSyxNQUFNLE9BQU8saUJBQWlCLEVBQUUsQ0FBQztBQUFBLFVBQzNDO0FBQUEsUUFDRjtBQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsS0FBSyxRQUFRO0FBQ1gsWUFBSSxRQUFRO0FBQ1YsZ0JBQU0sTUFBTSxPQUFPLGFBQWE7QUFDaEMsY0FBSTtBQUFLLHNCQUFVLFVBQVUsVUFBVSxHQUFHO0FBQUEsUUFDNUM7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUdBLEtBQUs7QUFDSCxZQUFJO0FBQVEsdUJBQWEsUUFBUSxJQUFJO0FBQ3JDO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUFRLHVCQUFhLFFBQVEsR0FBRztBQUNwQztBQUFBLE1BQ0YsS0FBSztBQUNILFlBQUk7QUFBUSx1QkFBYSxRQUFRLE9BQU8sTUFBTTtBQUM5QztBQUFBLE1BQ0YsS0FBSztBQUNILFlBQUk7QUFBUSx1QkFBYSxRQUFRLElBQUk7QUFDckM7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQVEsdUJBQWEsUUFBUSxJQUFJO0FBQ3JDO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUFRLHVCQUFhLFFBQVEsU0FBUyxRQUFRO0FBQ2xEO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUFRLHVCQUFhLFFBQVEsU0FBUyxRQUFRO0FBQ2xEO0FBQUEsTUFFRixLQUFLO0FBQ0gsWUFBSTtBQUFRLDJCQUFpQixRQUFRLElBQUk7QUFDekM7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQVEsMkJBQWlCLFFBQVEsS0FBSztBQUMxQztBQUFBLE1BQ0YsS0FBSztBQUNILGFBQUssb0JBQW9CO0FBQ3pCO0FBQUEsTUFDRixLQUFLO0FBQ0gsYUFBSyxzQkFBc0I7QUFDM0I7QUFBQSxNQUVGLEtBQUssb0JBQW9CO0FBQ3ZCLFlBQUksQ0FBQztBQUFRO0FBQ2IsY0FBTSxTQUFTLENBQUMsQ0FBQyxPQUFPLGFBQWE7QUFDckMsY0FBTSxNQUFNLFNBQ1IsT0FBTyxhQUFhLElBQ3BCLE9BQU8sUUFBUSxPQUFPLFVBQVUsRUFBRSxJQUFJO0FBQzFDLGNBQU0sVUFBVSxJQUNiLFFBQVEsZ0JBQWdCLEVBQUUsRUFDMUIsUUFBUSxtQkFBbUIsSUFBSSxFQUMvQixRQUFRLGVBQWUsSUFBSSxFQUMzQixRQUFRLGFBQWEsSUFBSSxFQUN6QixRQUFRLGVBQWUsSUFBSSxFQUMzQixRQUFRLGVBQWUsSUFBSSxFQUMzQixRQUFRLGFBQWEsSUFBSSxFQUN6QixRQUFRLG1CQUFtQixFQUFFO0FBQ2hDLFlBQUk7QUFBUSxpQkFBTyxpQkFBaUIsT0FBTztBQUFBO0FBQ3RDLGlCQUFPLFFBQVEsT0FBTyxVQUFVLEVBQUUsTUFBTSxPQUFPO0FBQ3BEO0FBQUEsTUFDRjtBQUFBLE1BQ0EsS0FBSyxnQkFBZ0I7QUFDbkIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLFVBQVUsQ0FBQyxDQUFDLE9BQU8sYUFBYTtBQUN0QyxjQUFNLE9BQU8sVUFDVCxPQUFPLGFBQWEsSUFDcEIsT0FBTyxRQUFRLE9BQU8sVUFBVSxFQUFFLElBQUk7QUFDMUMsY0FBTSxXQUFXLEtBQ2QsUUFBUSxtQkFBbUIsSUFBSSxFQUMvQixRQUFRLGVBQWUsSUFBSSxFQUMzQixRQUFRLGFBQWEsSUFBSSxFQUN6QixRQUFRLGVBQWUsSUFBSSxFQUMzQixRQUFRLGVBQWUsSUFBSSxFQUMzQixRQUFRLGFBQWEsSUFBSSxFQUN6QixRQUFRLG1CQUFtQixFQUFFO0FBQ2hDLFlBQUk7QUFBUyxpQkFBTyxpQkFBaUIsUUFBUTtBQUFBO0FBQ3hDLGlCQUFPLFFBQVEsT0FBTyxVQUFVLEVBQUUsTUFBTSxRQUFRO0FBQ3JEO0FBQUEsTUFDRjtBQUFBLE1BR0EsS0FBSyxlQUFlO0FBQ2xCLFlBQUksQ0FBQztBQUFRO0FBQ2IsY0FBTSxRQUFRO0FBQUEsVUFDWjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUNBO0FBQUEsVUFDRTtBQUFBLFVBQ0EsTUFBTSxJQUFJLENBQUMsT0FBTztBQUFBLFlBQ2hCLE9BQU87QUFBQSxZQUNQLE9BQU8sZUFBZSxDQUFDO0FBQUEsWUFDdkIsUUFBUSxNQUFNO0FBQ1osb0JBQU0sTUFBTSxTQUFTLGVBQWUsZ0JBQWdCO0FBQ3BELGtCQUFJO0FBQUssb0JBQUksY0FBYztBQUMzQixrQkFBSSxRQUFRO0FBQ1Ysc0JBQU0sTUFBTSxPQUFPLGFBQWE7QUFDaEMsb0JBQUk7QUFDRix5QkFBTztBQUFBLG9CQUNMLDRCQUE0QixDQUFDLEtBQUssR0FBRztBQUFBLGtCQUN2QztBQUFBLHFCQUNHO0FBQ0gsa0JBQUMsSUFBSSxNQUFjLFVBQVUsWUFBWSxDQUFDO0FBQzFDLHNCQUFJLFVBQVUsUUFBUSxZQUFZO0FBQUEsZ0JBQ3BDO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxVQUNGLEVBQUU7QUFBQSxRQUNKO0FBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLLGFBQWE7QUFDaEIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLFFBQVE7QUFBQSxVQUNaO0FBQUEsVUFBRztBQUFBLFVBQUc7QUFBQSxVQUFJO0FBQUEsVUFBSTtBQUFBLFVBQUk7QUFBQSxVQUFJO0FBQUEsVUFBSTtBQUFBLFVBQUk7QUFBQSxVQUFJO0FBQUEsVUFBSTtBQUFBLFVBQUk7QUFBQSxVQUFJO0FBQUEsVUFBSTtBQUFBLFVBQUk7QUFBQSxVQUFJO0FBQUEsUUFDNUQ7QUFDQTtBQUFBLFVBQ0U7QUFBQSxVQUNBLE1BQU0sSUFBSSxDQUFDLE9BQU87QUFBQSxZQUNoQixPQUFPLEdBQUcsQ0FBQztBQUFBLFlBQ1gsUUFBUSxNQUFNO0FBQ1osb0JBQU0sTUFBTSxTQUFTLGVBQWUsZ0JBQWdCO0FBQ3BELGtCQUFJO0FBQUssb0JBQUksY0FBYyxPQUFPLENBQUM7QUFDbkMsa0JBQUksUUFBUTtBQUNWLHNCQUFNLE1BQU0sT0FBTyxhQUFhO0FBQ2hDLG9CQUFJO0FBQ0YseUJBQU87QUFBQSxvQkFDTCwwQkFBMEIsQ0FBQyxPQUFPLEdBQUc7QUFBQSxrQkFDdkM7QUFBQSxxQkFDRztBQUNILGtCQUFDLElBQUksTUFBYyxVQUFVLGdCQUFnQixDQUFDO0FBQzlDLHNCQUFJLFVBQVUsUUFBUSxZQUFZO0FBQUEsZ0JBQ3BDO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxVQUNGLEVBQUU7QUFBQSxRQUNKO0FBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLLGNBQWM7QUFDakIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLFNBQVM7QUFBQSxVQUNiLEVBQUUsT0FBTyxTQUFTLEtBQUssVUFBVTtBQUFBLFVBQ2pDLEVBQUUsT0FBTyxZQUFZLEtBQUssVUFBVTtBQUFBLFVBQ3BDLEVBQUUsT0FBTyxPQUFPLEtBQUssVUFBVTtBQUFBLFVBQy9CLEVBQUUsT0FBTyxVQUFVLEtBQUssVUFBVTtBQUFBLFVBQ2xDLEVBQUUsT0FBTyxVQUFVLEtBQUssVUFBVTtBQUFBLFVBQ2xDLEVBQUUsT0FBTyxTQUFTLEtBQUssVUFBVTtBQUFBLFVBQ2pDLEVBQUUsT0FBTyxRQUFRLEtBQUssVUFBVTtBQUFBLFVBQ2hDLEVBQUUsT0FBTyxVQUFVLEtBQUssVUFBVTtBQUFBLFVBQ2xDLEVBQUUsT0FBTyxTQUFTLEtBQUssVUFBVTtBQUFBLFVBQ2pDLEVBQUUsT0FBTyxRQUFRLEtBQUssVUFBVTtBQUFBLFFBQ2xDO0FBQ0E7QUFBQSxVQUNFO0FBQUEsVUFDQSxPQUFPLElBQUksQ0FBQyxPQUFPO0FBQUEsWUFDakIsT0FBTyxFQUFFO0FBQUEsWUFDVCxPQUFPLFNBQVMsRUFBRSxHQUFHLElBQUksRUFBRSxRQUFRLFlBQVksb0JBQW9CLEVBQUU7QUFBQSxZQUNyRSxRQUFRLE1BQU07QUFDWixvQkFBTSxLQUFLLFNBQVMsZUFBZSxrQkFBa0I7QUFDckQsa0JBQUk7QUFBSSxtQkFBRyxNQUFNLGFBQWEsRUFBRTtBQUNoQyxrQkFBSSxRQUFRO0FBQ1Ysc0JBQU0sTUFBTSxPQUFPLGFBQWE7QUFDaEMsb0JBQUk7QUFDRix5QkFBTztBQUFBLG9CQUNMLHNCQUFzQixFQUFFLEdBQUcsS0FBSyxHQUFHO0FBQUEsa0JBQ3JDO0FBQUEsY0FDSjtBQUFBLFlBQ0Y7QUFBQSxVQUNGLEVBQUU7QUFBQSxRQUNKO0FBQ0E7QUFBQSxNQUNGO0FBQUEsTUFHQSxLQUFLLFNBQVM7QUFDWixZQUFJLENBQUM7QUFBUTtBQUNiLGNBQU0sZUFBZTtBQUFBLFVBQ25CLEVBQUUsT0FBTyxzQkFBaUIsT0FBTyxRQUFRLFVBQVUsU0FBUztBQUFBLFVBQzVELEVBQUUsT0FBTyxrQkFBYSxPQUFPLFVBQVUsVUFBVSxTQUFTO0FBQUEsVUFDMUQsRUFBRSxPQUFPLHVCQUFrQixPQUFPLFNBQVMsVUFBVSxTQUFTO0FBQUEsVUFDOUQsRUFBRSxPQUFPLG1CQUFjLE9BQU8sV0FBVyxVQUFVLFNBQVM7QUFBQSxRQUM5RDtBQUNBO0FBQUEsVUFDRTtBQUFBLFVBQ0EsYUFBYSxJQUFJLENBQUMsT0FBTztBQUFBLFlBQ3ZCLE9BQU8sRUFBRTtBQUFBLFlBQ1QsVUFBVSxFQUFFO0FBQUEsWUFDWixRQUFRLE1BQU07QUFDWixrQkFBSSxDQUFDLFFBQVE7QUFDWCxvQkFBSSx1QkFBTyxrQkFBa0I7QUFDN0I7QUFBQSxjQUNGO0FBQ0Esb0JBQU0sTUFBTSxPQUFPLGFBQWE7QUFDaEMsa0JBQUksS0FBSztBQUNQLHVCQUFPO0FBQUEsa0JBQ0wsMEJBQTBCLEVBQUUsS0FBSztBQUFBO0FBQUEsRUFBUyxHQUFHO0FBQUE7QUFBQTtBQUFBLGdCQUMvQztBQUFBLGNBQ0YsT0FBTztBQUNMLHNCQUFNLE9BQU8sT0FBTyxRQUFRLE9BQU8sVUFBVSxFQUFFLElBQUk7QUFDbkQsdUJBQU87QUFBQSxrQkFDTCxPQUFPLFVBQVUsRUFBRTtBQUFBLGtCQUNuQiwwQkFBMEIsRUFBRSxLQUFLLEtBQUssSUFBSTtBQUFBLGdCQUM1QztBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRixFQUFFO0FBQUEsUUFDSjtBQUNBO0FBQUEsTUFDRjtBQUFBLE1BR0EsS0FBSyxvQkFBb0I7QUFDdkIsWUFBSSxLQUFLLGVBQWUsR0FBRztBQUN6QixlQUFLO0FBQ0wsZ0JBQU0sSUFDSixTQUNDLFNBQVMsY0FBYyxxQkFBcUI7QUFDL0MsY0FBSTtBQUFHLGlCQUFLLG9CQUFvQixDQUFDO0FBQUEsUUFDbkM7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUssc0JBQXNCO0FBQ3pCLFlBQUksS0FBSyxlQUFlLFlBQVksU0FBUyxHQUFHO0FBQzlDLGVBQUs7QUFDTCxnQkFBTSxJQUNKLFNBQ0MsU0FBUyxjQUFjLHFCQUFxQjtBQUMvQyxjQUFJO0FBQUcsaUJBQUssb0JBQW9CLENBQUM7QUFBQSxRQUNuQztBQUNBO0FBQUEsTUFDRjtBQUFBLE1BR0EsS0FBSztBQUFBLE1BQ0wsS0FBSyxvQkFBb0I7QUFDdkIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLE1BQ0osS0FBSyxnQkFBZ0IsUUFBUSxxQkFBcUIsSUFBSTtBQUN4RCxjQUFNLElBQUksWUFBWSxHQUFHO0FBQ3pCLFlBQUksQ0FBQztBQUFHO0FBQ1IsWUFBSSxFQUFFLFFBQVE7QUFDWixnQkFBTSxNQUFNLE9BQU8sYUFBYTtBQUNoQyxpQkFBTyxpQkFBaUIsR0FBRyxFQUFFLE1BQU0sR0FBRyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRTtBQUFBLFFBQzlELFdBQVcsRUFBRSxXQUFXLElBQUk7QUFDMUIsZ0JBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsZ0JBQU0sT0FBTyxPQUFPLFFBQVEsT0FBTyxJQUFJO0FBQ3ZDLGlCQUFPLFFBQVEsT0FBTyxNQUFNLEtBQUssUUFBUSxjQUFjLEVBQUUsQ0FBQztBQUFBLFFBQzVELE9BQU87QUFDTCwyQkFBaUIsUUFBUSxFQUFFLE1BQU07QUFBQSxRQUNuQztBQUNBO0FBQUEsTUFDRjtBQUFBLE1BR0EsS0FBSyxtQkFBbUI7QUFDdEIsWUFBSSxDQUFDO0FBQVE7QUFDYjtBQUFBLFVBQ0U7QUFBQSxVQUNBO0FBQUEsWUFDRSxHQUFHLFlBQVksSUFBSSxDQUFDLE9BQU87QUFBQSxjQUN6QixPQUFPLEVBQUU7QUFBQSxjQUNULE9BQU8sRUFBRSxRQUFRO0FBQUEsY0FDakIsUUFBUSxNQUFNO0FBQ1osb0JBQUksQ0FBQztBQUFRO0FBQ2Isb0JBQUksRUFBRSxRQUFRO0FBQ1osd0JBQU0sTUFBTSxPQUFPLGFBQWE7QUFDaEMseUJBQU87QUFBQSxvQkFDTCxHQUFHLEVBQUUsTUFBTSxHQUFHLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTTtBQUFBLGtCQUNwQztBQUFBLGdCQUNGLFdBQVcsRUFBRSxXQUFXLElBQUk7QUFDMUIsd0JBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsd0JBQU0sT0FBTyxPQUFPLFFBQVEsT0FBTyxJQUFJO0FBQ3ZDLHlCQUFPLFFBQVEsT0FBTyxNQUFNLEtBQUssUUFBUSxjQUFjLEVBQUUsQ0FBQztBQUFBLGdCQUM1RCxPQUFPO0FBQ0wsbUNBQWlCLFFBQVEsRUFBRSxNQUFNO0FBQUEsZ0JBQ25DO0FBQUEsY0FDRjtBQUFBLFlBQ0YsRUFBRTtBQUFBLFlBQ0YsRUFBRSxPQUFPLElBQUksU0FBUyxNQUFNLFFBQVEsTUFBTTtBQUFBLFlBQUMsRUFBRTtBQUFBLFlBQzdDO0FBQUEsY0FDRSxPQUFPO0FBQUEsY0FDUCxPQUFPO0FBQUEsY0FDUCxRQUFRLE1BQU07QUFDWixvQkFBSSxDQUFDO0FBQVE7QUFDYixzQkFBTSxVQUFVLENBQUMsQ0FBQyxPQUFPLGFBQWE7QUFDdEMsc0JBQU0sT0FBTyxVQUNULE9BQU8sYUFBYSxJQUNwQixPQUFPLFFBQVEsT0FBTyxVQUFVLEVBQUUsSUFBSTtBQUMxQyxzQkFBTSxXQUFXLEtBQ2QsUUFBUSxnQkFBZ0IsRUFBRSxFQUMxQixRQUFRLG1CQUFtQixJQUFJLEVBQy9CLFFBQVEsZUFBZSxJQUFJLEVBQzNCLFFBQVEsYUFBYSxJQUFJLEVBQ3pCLFFBQVEsZUFBZSxJQUFJLEVBQzNCLFFBQVEsZUFBZSxJQUFJLEVBQzNCLFFBQVEsYUFBYSxJQUFJLEVBQ3pCLFFBQVEsbUJBQW1CLEVBQUU7QUFDaEMsb0JBQUk7QUFBUyx5QkFBTyxpQkFBaUIsUUFBUTtBQUFBO0FBQ3hDLHlCQUFPLFFBQVEsT0FBTyxVQUFVLEVBQUUsTUFBTSxRQUFRO0FBQUEsY0FDdkQ7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFVBQ0EsRUFBRSxJQUFJLFdBQVcsU0FBUyxXQUFXLE9BQU8sVUFBVTtBQUFBLFFBQ3hEO0FBQ0E7QUFBQSxNQUNGO0FBQUEsTUFHQSxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQ0gsWUFBSTtBQUFRLDJCQUFpQixRQUFRLFFBQVE7QUFDN0M7QUFBQSxNQUVGLEtBQUssaUJBQWlCO0FBQ3BCLFlBQUk7QUFBUSwyQkFBaUIsUUFBUSxHQUFHO0FBQ3hDO0FBQUEsTUFDRjtBQUFBLE1BR0EsU0FBUztBQUNQLFlBQUksSUFBSSxXQUFXLE1BQU0sS0FBSyxRQUFRO0FBQ3BDLG1CQUFTLEtBQUssTUFBTTtBQUNwQixlQUFLLGlCQUFpQixNQUFNO0FBQUEsUUFDOUI7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUVBLEtBQUs7QUFDSCxZQUFJO0FBQ0YsaUJBQU8sYUFBYSxzQkFBc0IsT0FBTyxVQUFVLENBQUM7QUFDOUQ7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQ0YsaUJBQU8sYUFBYSxxQkFBcUIsT0FBTyxVQUFVLENBQUM7QUFDN0Q7QUFBQSxNQUVGLEtBQUssYUFBYTtBQUNoQixhQUFLLG9CQUFvQjtBQUN6QixtQkFBVyxNQUFNO0FBQ2YsZ0JBQU0sUUFBUSxTQUFTO0FBQUEsWUFDckI7QUFBQSxVQUNGO0FBQ0EsY0FBSSxPQUFPO0FBQ1Qsa0JBQU0sUUFBUTtBQUNkLGtCQUFNLGNBQWMsSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUFBLFVBQ3hDO0FBQUEsUUFDRixHQUFHLEdBQUc7QUFDTjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUssY0FBYztBQUNqQixjQUFNLFVBQVUsUUFBUSxTQUFTLEtBQUs7QUFDdEMsa0JBQVUsVUFDUCxVQUFVLE9BQU8sRUFDakIsS0FBSyxNQUFNLElBQUksdUJBQU8sa0NBQWtDLENBQUM7QUFDNUQ7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLLG1CQUFtQjtBQUN0QixZQUFJLENBQUM7QUFBUTtBQUNiLGNBQU0sTUFBTSxvQkFBSSxLQUFLO0FBQ3JCLGNBQU0sT0FBTztBQUFBLFFBQWMsSUFBSSxtQkFBbUIsQ0FBQztBQUFBLFFBQVcsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsTUFBTSxXQUFXLFFBQVEsVUFBVSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2hJLGVBQU8sYUFBYSxNQUFNLE9BQU8sVUFBVSxDQUFDO0FBQzVDO0FBQUEsTUFDRjtBQUFBLE1BQ0EsS0FBSztBQUNILGFBQUssY0FBYztBQUNuQjtBQUFBLE1BQ0YsS0FBSztBQUNILGFBQUssaUJBQWlCO0FBQ3RCO0FBQUEsTUFDRixLQUFLO0FBQ0gsYUFBSyxtQkFBbUI7QUFDeEI7QUFBQSxNQUdGLEtBQUssa0JBQWtCO0FBQ3JCLFlBQUksQ0FBQyxVQUFVLENBQUM7QUFBUTtBQUd4QixZQUFLLE9BQWUsY0FBYztBQUNoQyxnQkFBTSxTQUFVLE9BQWU7QUFJL0IsZ0JBQU1DLFNBQVEsT0FBTyxhQUFhO0FBQ2xDLGNBQUksVUFBVUEsUUFBTztBQUNuQixnQkFBSSxTQUFTQTtBQUNiLGdCQUFJLE9BQU87QUFBYSx1QkFBUyxNQUFNLE1BQU07QUFDN0MsZ0JBQUksT0FBTztBQUFVLHVCQUFTLElBQUksTUFBTTtBQUN4QyxnQkFBSSxPQUFPO0FBQVEsdUJBQVMsS0FBSyxNQUFNO0FBQ3ZDLG1CQUFPLGlCQUFpQixNQUFNO0FBQzlCLGdCQUFJLE9BQU8sWUFBWTtBQUNyQixvQkFBTUMsWUFBVyxPQUFPLFVBQVU7QUFDbEMsb0JBQU1DLFVBQVMsT0FBTyxRQUFRRCxVQUFTLElBQUk7QUFDM0Msa0JBQUksQ0FBQ0MsUUFBTyxXQUFXLE9BQU8sVUFBVSxHQUFHO0FBQ3pDLHVCQUFPO0FBQUEsa0JBQ0xELFVBQVM7QUFBQSxrQkFDVCxPQUFPLGFBQWFDLFFBQU8sUUFBUSxjQUFjLEVBQUU7QUFBQSxnQkFDckQ7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0YsV0FBVyxVQUFVLENBQUNGLFFBQU87QUFDM0IsZ0JBQUksdUJBQU8scURBQXFEO0FBQ2hFO0FBQUEsVUFDRjtBQUNBLFVBQUMsT0FBZSxlQUFlO0FBQy9CLFVBQUMsT0FBZSxTQUFTO0FBQ3pCLGlCQUFPLFVBQVUsT0FBTyxZQUFZO0FBQ3BDO0FBQUEsUUFDRjtBQUdBLGNBQU0sV0FBVyxPQUFPLFVBQVU7QUFDbEMsY0FBTSxTQUFTLE9BQU8sUUFBUSxTQUFTLElBQUk7QUFDM0MsY0FBTSxRQUFRLE9BQU8sYUFBYTtBQUNsQyxjQUFNLFFBQVEsU0FBUztBQUN2QixjQUFNLFNBQVMsT0FBTyxNQUFNLFlBQVk7QUFDeEMsUUFBQyxPQUFlLFNBQVM7QUFBQSxVQUN2QixZQUFZLFNBQVMsT0FBTyxDQUFDLElBQUk7QUFBQSxVQUNqQyxRQUFRLGdCQUFnQixLQUFLLEtBQUs7QUFBQSxVQUNsQyxVQUFVLCtCQUErQixLQUFLLEtBQUs7QUFBQSxVQUNuRCxhQUFhLE1BQU0sS0FBSyxLQUFLO0FBQUEsUUFDL0I7QUFDQSxRQUFDLE9BQWUsZUFBZTtBQUMvQixlQUFPLFVBQVUsSUFBSSxZQUFZO0FBQ2pDLFlBQUksdUJBQU8sOERBQThEO0FBQ3pFO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdRLGlCQUFpQixRQUFtQjtBQUMxQyxVQUFNLFdBQVcsT0FBTyxRQUFRLE9BQU8sVUFBVSxFQUFFLElBQUk7QUFDdkQsYUFDRyxpQkFBaUIsa0NBQWtDLEVBQ25ELFFBQVEsQ0FBQyxRQUFRO0FBQ2hCLFlBQU0sTUFBTSxJQUFJLGFBQWEsVUFBVSxLQUFLO0FBQzVDLFlBQU0sV0FBVyxZQUFZLEdBQUc7QUFDaEMsWUFBTSxRQUFRLElBQUksY0FBYyxnQkFBZ0I7QUFDaEQsVUFBSSxDQUFDLFNBQVMsQ0FBQztBQUFVO0FBQ3pCLFlBQU0sU0FBUyxTQUFTLFNBQVMsU0FBUyxNQUFNLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO0FBQy9ELFlBQU0sTUFBTSxhQUFhLFNBQVMsWUFBWTtBQUM5QyxZQUFNLE1BQU0sVUFBVTtBQUN0QixZQUFNLE1BQU0sYUFBYTtBQUN6QixZQUFNLE1BQU0saUJBQWlCO0FBQzdCLFlBQU0sWUFBWSxTQUNkLGdKQUNBO0FBQUEsSUFDTixDQUFDO0FBQUEsRUFDTDtBQUNGOzs7QUN4L0NBLElBQUFHLG1CQUE0QjtBQUU1QixJQUFNLGdCQUFnQjtBQUFBLEVBQ3BCO0FBQUEsRUFBUTtBQUFBLEVBQVk7QUFBQSxFQUFRO0FBQUEsRUFBTztBQUFBLEVBQ25DO0FBQUEsRUFBWTtBQUFBLEVBQVc7QUFBQSxFQUFXO0FBQUEsRUFBVTtBQUFBLEVBQU87QUFBQSxFQUFXO0FBQ2hFO0FBRU8sSUFBTSxZQUFOLE1BQWdCO0FBQUEsRUFDckIsT0FBTyxXQUF3QixLQUFnQjtBQUM3QyxVQUFNLFFBQVEsVUFBVSxVQUFVO0FBQ2xDLFVBQU0sU0FBUyxlQUFlO0FBQzlCLFVBQU0sYUFBYSxjQUFjLFFBQVE7QUFDekMsVUFBTSxNQUFNLFVBQVU7QUFDdEIsVUFBTSxZQUFZLEtBQUssVUFBVTtBQUNqQyxTQUFLLGFBQWEsT0FBTyxHQUFHO0FBQzVCLGNBQVUsWUFBWSxLQUFLO0FBQUEsRUFDN0I7QUFBQSxFQUVRLFlBQW9CO0FBQzFCLFdBQU87QUFBQSxRQUNILEtBQUssZ0JBQWdCLENBQUM7QUFBQSxRQUN0QixLQUFLLGdCQUFnQixDQUFDO0FBQUEsUUFDdEIsS0FBSyxlQUFlLENBQUM7QUFBQSxRQUNyQixLQUFLLGdCQUFnQixDQUFDO0FBQUEsUUFDdEIsS0FBSyxlQUFlLENBQUM7QUFBQSxRQUNyQixLQUFLLG1CQUFtQixDQUFDO0FBQUEsUUFDekIsS0FBSyxnQkFBZ0IsQ0FBQztBQUFBLFFBQ3RCLEtBQUssaUJBQWlCLENBQUM7QUFBQTtBQUFBLEVBRTdCO0FBQUE7QUFBQSxFQUdRLGtCQUEwQjtBQUNoQyxXQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBWVQ7QUFBQTtBQUFBLEVBR1Esa0JBQTBCO0FBQ2hDLFdBQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWFUO0FBQUE7QUFBQSxFQUdRLGlCQUF5QjtBQUMvQixXQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQW9CVDtBQUFBO0FBQUEsRUFHUSxrQkFBMEI7QUFDaEMsV0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXFCVDtBQUFBO0FBQUEsRUFHUSxpQkFBeUI7QUFDL0IsV0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXFCVDtBQUFBO0FBQUEsRUFHUSxxQkFBNkI7QUFDbkMsV0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBK0JUO0FBQUE7QUFBQSxFQUdRLGtCQUEwQjtBQUNoQyxXQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBMkJUO0FBQUE7QUFBQSxFQUdRLG1CQUEyQjtBQUNqQyxXQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFrQ1Q7QUFBQTtBQUFBLEVBR1EsYUFBYSxXQUF3QixLQUFnQjtBQUMzRCxjQUFVLGlCQUFpQixZQUFZLEVBQUUsUUFBUSxRQUFNO0FBQ3JELFNBQUcsaUJBQWlCLGFBQWEsQ0FBQyxNQUFNO0FBQ3RDLFVBQUUsZUFBZTtBQUFBLE1BQ25CLENBQUM7QUFDRCxTQUFHLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNsQyxVQUFFLGdCQUFnQjtBQUNsQixhQUFLLGVBQWUsR0FBRyxhQUFhLFVBQVUsR0FBRyxLQUFLLFNBQVM7QUFBQSxNQUNqRSxDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRVEsZUFBZSxLQUFvQixLQUFVLFdBQThCO0FBQ2pGLFFBQUksQ0FBQztBQUFLO0FBQ1YsVUFBTSxTQUFTLElBQUksVUFBVSxjQUFjO0FBRTNDLFVBQU0saUJBQWlCLENBQUMsTUFBYyxhQUFhLE1BQU07QUFDdkQsVUFBSSxDQUFDO0FBQVE7QUFDYixZQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLGFBQU8sYUFBYSxNQUFNLE1BQU07QUFDaEMsVUFBSSxhQUFhLEdBQUc7QUFDbEIsY0FBTSxVQUFVLE9BQU8sT0FBTyxLQUFLLE1BQU0sSUFBSSxFQUFFLFNBQVM7QUFDeEQsY0FBTSxRQUFRLEtBQUssTUFBTSxJQUFJO0FBQzdCLGNBQU0sUUFBUSxlQUFlLElBQUksT0FBTyxLQUFLLEtBQUssU0FDOUMsTUFBTSxNQUFNLFNBQVMsQ0FBQyxFQUFFLFNBQVM7QUFDckMsZUFBTyxVQUFVLEVBQUUsTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDO0FBQUEsTUFDL0M7QUFBQSxJQUNGO0FBRUEsVUFBTSxVQUFVLE1BQWM7QUFDNUIsWUFBTSxJQUFLLE9BQWU7QUFDMUIsYUFBTyxJQUFJLEVBQUUsRUFBRSxPQUFPLFlBQVksS0FBSyxNQUFNO0FBQzNDLGNBQU0sSUFBSSxvQkFBSSxLQUFLO0FBQ25CLGVBQU8sR0FBRyxFQUFFLFlBQVksQ0FBQyxJQUFJLE9BQU8sRUFBRSxTQUFTLElBQUUsQ0FBQyxFQUFFLFNBQVMsR0FBRSxHQUFHLENBQUMsSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsU0FBUyxHQUFFLEdBQUcsQ0FBQztBQUFBLE1BQzVHLEdBQUc7QUFBQSxJQUNMO0FBRUEsVUFBTSxVQUFVLE1BQWM7QUFDNUIsWUFBTSxJQUFLLE9BQWU7QUFDMUIsYUFBTyxJQUFJLEVBQUUsRUFBRSxPQUFPLE9BQU8sS0FBSyxNQUFNO0FBQ3RDLGNBQU0sSUFBSSxvQkFBSSxLQUFLO0FBQ25CLGVBQU8sR0FBRyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUUsU0FBUyxHQUFFLEdBQUcsQ0FBQyxJQUFJLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRSxTQUFTLEdBQUUsR0FBRyxDQUFDO0FBQUEsTUFDMUYsR0FBRztBQUFBLElBQ0w7QUFFQSxZQUFRLEtBQUs7QUFBQSxNQUNYLEtBQUs7QUFDSCx1QkFBZSxJQUFJO0FBQ25CO0FBQUEsTUFFRixLQUFLLGdCQUFnQjtBQUNuQixZQUFJLENBQUM7QUFBUTtBQUNiLGNBQU0sUUFBUTtBQUNkLHVCQUFlLEtBQUs7QUFDcEI7QUFBQSxNQUNGO0FBQUEsTUFFQSxLQUFLO0FBQUEsTUFDTCxLQUFLLGNBQWM7QUFDakIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLGVBQU8sYUFBYSxTQUFTLE1BQU07QUFDbkMsZUFBTyxVQUFVLEVBQUUsTUFBTSxPQUFPLE1BQU0sSUFBSSxPQUFPLEtBQUssRUFBRSxDQUFDO0FBQ3pEO0FBQUEsTUFDRjtBQUFBLE1BRUEsS0FBSyxnQkFBZ0I7QUFDbkIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLGVBQU8sYUFBYSxTQUFTLE1BQU07QUFDbkMsZUFBTyxVQUFVLEVBQUUsTUFBTSxPQUFPLE1BQU0sSUFBSSxPQUFPLEtBQUssRUFBRSxDQUFDO0FBQ3pEO0FBQUEsTUFDRjtBQUFBLE1BRUEsS0FBSyxnQkFBZ0I7QUFDbkIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLE1BQU07QUFDWixjQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLGVBQU8sYUFBYSxLQUFLLE1BQU07QUFDL0I7QUFBQSxNQUNGO0FBQUEsTUFFQSxLQUFLLGVBQWU7QUFDbEIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLE1BQU0sT0FBTyxhQUFhO0FBQ2hDLGNBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsWUFBSSxLQUFLO0FBQ1AsaUJBQU8saUJBQWlCLElBQUksR0FBRyxLQUFLO0FBQ3BDLGdCQUFNLFlBQVksT0FBTyxVQUFVO0FBQ25DLGlCQUFPLFVBQVUsRUFBRSxNQUFNLFVBQVUsTUFBTSxJQUFJLFVBQVUsS0FBSyxFQUFFLENBQUM7QUFBQSxRQUNqRSxPQUFPO0FBQ0wsaUJBQU8sYUFBYSxRQUFRLE1BQU07QUFDbEMsaUJBQU8sVUFBVSxFQUFFLE1BQU0sT0FBTyxNQUFNLElBQUksT0FBTyxLQUFLLEVBQUUsQ0FBQztBQUFBLFFBQzNEO0FBQ0E7QUFBQSxNQUNGO0FBQUEsTUFFQSxLQUFLLG1CQUFtQjtBQUN0QixZQUFJLENBQUM7QUFBUTtBQUNiLGNBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsZUFBTyxhQUFhLFFBQVEsTUFBTTtBQUNsQyxlQUFPLFVBQVUsRUFBRSxNQUFNLE9BQU8sTUFBTSxJQUFJLE9BQU8sS0FBSyxFQUFFLENBQUM7QUFDekQ7QUFBQSxNQUNGO0FBQUEsTUFFQSxLQUFLO0FBQ0gsdUJBQWUsUUFBUSxDQUFDO0FBQ3hCO0FBQUEsTUFFRixLQUFLO0FBQ0gsdUJBQWUsUUFBUSxDQUFDO0FBQ3hCO0FBQUEsTUFFRixLQUFLO0FBQ0gsdUJBQWUsR0FBRyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsRUFBRTtBQUMxQztBQUFBLE1BRUYsS0FBSyxtQkFBbUI7QUFDdEIsY0FBTSxTQUFTLElBQUksU0FBUyxtQkFBbUIsaUJBQWlCO0FBQ2hFLFlBQUksQ0FBQyxRQUFRO0FBQ1gsY0FBSSx3QkFBTyw4REFBOEQ7QUFBQSxRQUMzRTtBQUNBO0FBQUEsTUFDRjtBQUFBLE1BRUEsS0FBSztBQUNILGFBQUssa0JBQWtCLFFBQVEsU0FBUztBQUN4QztBQUFBLE1BRUYsS0FBSyxxQkFBcUI7QUFDeEIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLGNBQU0sUUFBUTtBQUNkLGVBQU8sYUFBYSxPQUFPLE1BQU07QUFDakMsZUFBTyxVQUFVLEVBQUUsTUFBTSxPQUFPLE9BQU8sR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUNqRDtBQUFBLE1BQ0Y7QUFBQSxNQUVBLEtBQUssZUFBZTtBQUNsQixZQUFJLENBQUM7QUFBUTtBQUNiLGNBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsZUFBTyxhQUFhLFlBQVksTUFBTTtBQUN0QyxlQUFPLFVBQVUsRUFBRSxNQUFNLE9BQU8sT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDO0FBQ2pEO0FBQUEsTUFDRjtBQUFBLE1BRUEsS0FBSztBQUNILHVCQUFlLFNBQVM7QUFDeEI7QUFBQSxNQUVGLEtBQUssbUJBQW1CO0FBQ3RCLFlBQUksQ0FBQztBQUFRO0FBQ2IsY0FBTSxTQUFTLE9BQU8sVUFBVTtBQUNoQyxlQUFPLGFBQWEsUUFBUSxNQUFNO0FBQ2xDLGNBQU0sV0FBVyxPQUFPLFNBQVM7QUFDakMsY0FBTSxTQUFTLEVBQUUsTUFBTSxVQUFVLElBQUksT0FBTyxRQUFRLFFBQVEsRUFBRSxPQUFPO0FBQ3JFLGVBQU8sYUFBYSxZQUFZLE1BQU07QUFDdEM7QUFBQSxNQUNGO0FBQUEsTUFFQSxLQUFLLGNBQWM7QUFDakIsWUFBSSxDQUFDO0FBQVE7QUFDYixjQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLGVBQU8sYUFBYSxLQUFLLE1BQU07QUFDL0IsZUFBTyxVQUFVLEVBQUUsTUFBTSxPQUFPLE1BQU0sSUFBSSxPQUFPLEtBQUssRUFBRSxDQUFDO0FBQ3pEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFUSxrQkFBa0IsUUFBYSxXQUE4QjtBQUVuRSxjQUFVLGNBQWMscUJBQXFCLEdBQUcsT0FBTztBQUV2RCxVQUFNLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDM0MsV0FBTyxZQUFZO0FBQ25CLFdBQU8sT0FBTyxPQUFPLE9BQU87QUFBQSxNQUMxQixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsTUFDWixRQUFRO0FBQUEsTUFDUixjQUFjO0FBQUEsTUFDZCxXQUFXO0FBQUEsTUFDWCxTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixLQUFLO0FBQUEsTUFDTCxVQUFVO0FBQUEsTUFDVixRQUFRO0FBQUEsSUFDVixDQUFDO0FBRUQsa0JBQWMsUUFBUSxVQUFRO0FBQzVCLFlBQU0sTUFBTSxTQUFTLGNBQWMsS0FBSztBQUN4QyxVQUFJLGNBQWM7QUFDbEIsYUFBTyxPQUFPLElBQUksT0FBTztBQUFBLFFBQ3ZCLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFlBQVk7QUFBQSxNQUNkLENBQUM7QUFDRCxVQUFJLGlCQUFpQixjQUFjLE1BQU0sSUFBSSxNQUFNLGFBQWEsU0FBUztBQUN6RSxVQUFJLGlCQUFpQixjQUFjLE1BQU0sSUFBSSxNQUFNLGFBQWEsRUFBRTtBQUNsRSxVQUFJLGlCQUFpQixTQUFTLE1BQU07QUFDbEMsZUFBTyxPQUFPO0FBQ2QsWUFBSSxRQUFRO0FBQ1YsZ0JBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsaUJBQU8sYUFBYSxPQUFPLElBQUk7QUFBQSxLQUFTLE1BQU07QUFBQSxRQUNoRDtBQUFBLE1BQ0YsQ0FBQztBQUNELGFBQU8sWUFBWSxHQUFHO0FBQUEsSUFDeEIsQ0FBQztBQUdELFVBQU0sYUFBYSxVQUFVLGNBQWMsNkJBQTZCO0FBQ3hFLFFBQUksWUFBWTtBQUNkLFlBQU0sT0FBTyxXQUFXLHNCQUFzQjtBQUM5QyxhQUFPLE1BQU0sTUFBTSxHQUFHLEtBQUssU0FBUyxDQUFDO0FBQ3JDLGFBQU8sTUFBTSxPQUFPLEdBQUcsS0FBSyxJQUFJO0FBQUEsSUFDbEM7QUFFQSxhQUFTLEtBQUssWUFBWSxNQUFNO0FBR2hDLFVBQU0sUUFBUSxDQUFDLE1BQWtCO0FBQy9CLFVBQUksQ0FBQyxPQUFPLFNBQVMsRUFBRSxNQUFjLEdBQUc7QUFDdEMsZUFBTyxPQUFPO0FBQ2QsaUJBQVMsb0JBQW9CLFNBQVMsT0FBTyxJQUFJO0FBQUEsTUFDbkQ7QUFBQSxJQUNGO0FBQ0EsZUFBVyxNQUFNLFNBQVMsaUJBQWlCLFNBQVMsT0FBTyxJQUFJLEdBQUcsQ0FBQztBQUFBLEVBQ3JFO0FBQ0Y7OztBQ3ZkTyxJQUFNLE9BQU87QUFBQSxFQUNsQjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBR08sSUFBTSxjQUFOLE1BQWtCO0FBQUEsRUFNdkIsWUFBb0IsS0FBVTtBQUFWO0FBSnBCLFNBQVEsWUFBcUI7QUFDN0IsU0FBUSxZQUFZO0FBQ3BCLFNBQVEsU0FBUztBQUFBLEVBRWM7QUFBQSxFQUUvQixRQUFxQjtBQUVuQixhQUFTLGVBQWUscUJBQXFCLEdBQUcsT0FBTztBQUV2RCxTQUFLLEtBQUssU0FBUyxjQUFjLEtBQUs7QUFDdEMsU0FBSyxHQUFHLEtBQUs7QUFDYixTQUFLLEdBQUcsYUFBYSxtQkFBbUIsS0FBSyxTQUFTO0FBRXRELFNBQUssR0FBRyxZQUFZLEtBQUssVUFBVTtBQUNuQyxTQUFLLGFBQWE7QUFHbEIsVUFBTSxPQUFPLEtBQUssR0FBRyxjQUFjLFdBQVc7QUFDOUMsUUFBSSxRQUFRLEVBQUUsT0FBTyxNQUFNLEtBQUssR0FBRztBQUNuQyxRQUFJLFVBQVUsRUFBRSxPQUFPLE1BQU0sS0FBSyxHQUFHO0FBR3JDLFNBQUssb0JBQW9CLElBQUk7QUFHN0IsVUFBTSxNQUFNLFNBQVMsY0FBYyw0QkFBNEI7QUFDL0QsU0FBSyxlQUFlLGFBQWEsS0FBSyxJQUFJLEdBQUc7QUFHN0MsVUFBTSxXQUFXLFNBQVMsY0FBYyxXQUFXO0FBQ25ELFFBQUksVUFBVTtBQUNaLFlBQU0sV0FBVyxTQUFTLHNCQUFzQixFQUFFO0FBQ2xELFdBQUssR0FBRyxNQUFNLFlBQVksR0FBRyxRQUFRO0FBQUEsSUFDdkM7QUFFQSxXQUFPLEtBQUs7QUFBQSxFQUNkO0FBQUEsRUFFQSxVQUFVO0FBQ1IsU0FBSyxJQUFJLE9BQU87QUFBQSxFQUNsQjtBQUFBLEVBRVEsb0JBQW9CLE1BQW9CO0FBQzlDLFVBQU0sWUFBWSxRQUFTLEtBQUssR0FBRyxjQUFjLFdBQVc7QUFDNUQsY0FBVSxpQkFBaUIsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLE1BQU07QUFDMUQsTUFBQyxFQUFrQixNQUFNLFVBQ3ZCLEVBQUUsYUFBYSxZQUFZLE1BQU0sS0FBSyxZQUFZLEtBQUs7QUFBQSxJQUMzRCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRVEsWUFBb0I7QUFDMUIsVUFBTSxPQUFPLEtBQUs7QUFBQSxNQUNoQixDQUFDLE1BQ0MsdUJBQXVCLE1BQU0sS0FBSyxZQUFZLFdBQVcsRUFBRSxlQUFlLENBQUMsS0FBSyxDQUFDO0FBQUEsSUFDckYsRUFBRSxLQUFLLEVBQUU7QUFFVCxXQUFPO0FBQUE7QUFBQSxVQUVELElBQUk7QUFBQTtBQUFBLG1DQUVxQixLQUFLLFNBQVMsY0FBTyxFQUFFLElBQUksS0FBSyxZQUFZLGtCQUFhLGlCQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTXRHO0FBQUEsRUFFUSxlQUFlO0FBQ3JCLFNBQUssR0FBRyxpQkFBaUIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxRQUFRO0FBQ3BELFVBQUksaUJBQWlCLFNBQVMsTUFBTTtBQUNsQyxhQUFLLFlBQVksSUFBSSxhQUFhLFVBQVU7QUFDNUMsYUFBSyxHQUFHLGFBQWEsbUJBQW1CLEtBQUssU0FBUztBQUN0RCxhQUFLLEdBQ0YsaUJBQWlCLFVBQVUsRUFDM0IsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLE9BQU8sUUFBUSxDQUFDO0FBQzlDLFlBQUksVUFBVSxJQUFJLFFBQVE7QUFDMUIsYUFBSyxvQkFBb0I7QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBRUQsU0FBSyxHQUFHLGNBQWMsY0FBYyxHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDckUsV0FBSyxZQUFZLENBQUMsS0FBSztBQUN2QixZQUFNLE9BQU8sS0FBSyxHQUFHLGNBQWMsV0FBVztBQUM5QyxXQUFLLE1BQU0sVUFBVSxLQUFLLFlBQVksU0FBUztBQUMvQyxNQUFDLEtBQUssR0FBRyxjQUFjLGNBQWMsRUFBa0IsY0FBYyxLQUNsRSxZQUNDLGtCQUNBO0FBQUEsSUFDTixDQUFDO0FBQUEsRUFDSDtBQUNGOzs7QUgxR0EsSUFBcUIsc0JBQXJCLGNBQWlELHdCQUFPO0FBQUEsRUFHdEQsTUFBTSxTQUFTO0FBQ2IsU0FBSyxRQUFRLElBQUksWUFBWSxLQUFLLEdBQUc7QUFDckMsU0FBSyxJQUFJLFVBQVUsY0FBYyxNQUFNLEtBQUssTUFBTSxNQUFNLENBQUM7QUFBQSxFQUMzRDtBQUFBLEVBRUEsV0FBVztBQUNULFNBQUssTUFBTSxRQUFRO0FBQUEsRUFDckI7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImZwU2VsIiwgImZwQ3Vyc29yIiwgImZwTGluZSIsICJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
