import { App, Notice } from "obsidian";
import { showDropdown } from "../../shared/dropdown/Dropdown";
import { toggleInline } from "../../shared/toggleInline";
import { toggleSubSup } from "../../shared/toggleSubSup";
import { toggleLinePrefix } from "../../shared/toggleLinePrefix";
import { ClipboardGroup } from "./clipboard/ClipboardGroup";
import { BasicTextGroup } from "./basic-text/BasicTextGroup";
import { StylesGroup } from "./styles/StylesGroup";
import { STYLES_LIST } from "./styles/styles-data";
import { TagsGroup } from "./tags/TagsGroup";
import { tagNotation } from "./tags/tags-data";
import { applyTag } from "./tags/tag-apply/applyTag";
import { TagsDropdown } from "./tags/tags-dropdown/TagsDropdown";
import { EmailGroup } from "./email/EmailGroup";
import { NavigateGroup } from "./navigate/NavigateGroup";

export class HomeTab {
  private stylesOffset = 0;
  private stylesGroup = new StylesGroup();

  render(container: HTMLElement, app: App): void {
    const panel = document.createElement("div");
    panel.className = "onr-tab-panel";
    panel.setAttribute("data-panel", "Home");

    new ClipboardGroup().render(panel, app);
    new BasicTextGroup().render(panel, app);
    this.stylesGroup.render(
      panel,
      app,
      () => this.stylesOffset,
      (v) => {
        this.stylesOffset = v;
      },
    );
    new TagsGroup().render(panel, app);
    new EmailGroup().render(panel, app);
    new NavigateGroup().render(panel, app);

    this.attachWorkspaceListeners(panel, app);
    container.appendChild(panel);
  }

  // ── WORKSPACE LISTENERS (exact copy of former attachEvents) ───────
  private attachWorkspaceListeners(container: HTMLElement, app: App): void {
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
    const workspaceEl = document.querySelector(".workspace") ?? document.body;
    workspaceEl.addEventListener("click", onEditorInteract, true);
    workspaceEl.addEventListener("keyup", onEditorInteract, true);

    // Format Painter: auto-apply when user finishes a drag-select (OneNote-style)
    workspaceEl.addEventListener(
      "mouseup",
      (e) => {
        if (!(window as any)._onrFPActive) return;
        // If mouseup is on a ribbon button, let the click handler do phase 2 instead
        if ((e.target as Element)?.closest("[data-cmd]")) return;
        requestAnimationFrame(() => {
          const ed = app.workspace.activeEditor?.editor;
          const fp = (window as any)._onrFP as {
            headPrefix: string;
            isBold: boolean;
            isItalic: boolean;
            isUnderline: boolean;
          } | null;
          const sel = ed?.getSelection();

          // Always reset FP state regardless of whether we apply
          (window as any)._onrFPActive = false;
          (window as any)._onrFP = null;
          const fpBtn = (container.querySelector(
            '[data-cmd="format-painter"]',
          ) ??
            document.querySelector(
              '[data-panel="Home"] [data-cmd="format-painter"]',
            )) as HTMLElement | null;
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
      },
      true,
    );

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
        this.stylesGroup.refresh(panel);
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
    setActive(
      "italic",
      /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(mdContent) ||
        /\*\*\*(.*?)\*\*\*/.test(mdContent),
    );
    setActive("underline", /<u>/.test(line));
    setActive("strikethrough", /~~(.*?)~~/.test(mdContent));
    setActive("highlight", /==(.*?)==/.test(mdContent));
    // sub/sup: only active when cursor is inside the tag span
    const ch = cursor.ch;
    const isInSub = (() => {
      let p = 0;
      while (p < line.length) {
        const o = line.indexOf("<sub>", p);
        if (o < 0) break;
        const c2 = line.indexOf("</sub>", o);
        if (c2 < 0) break;
        if (ch > o + 4 && ch < c2 + 6) return true;
        p = c2 + 6;
      }
      return false;
    })();
    const isInSup = (() => {
      let p = 0;
      while (p < line.length) {
        const o = line.indexOf("<sup>", p);
        if (o < 0) break;
        const c2 = line.indexOf("</sup>", o);
        if (c2 < 0) break;
        if (ch > o + 4 && ch < c2 + 6) return true;
        p = c2 + 6;
      }
      return false;
    })();
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
      if (!s) {
        card.classList.remove("onr-active");
        return;
      }
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
          if (p) this.stylesGroup.refresh(p);
        }
        break;
      }
      case "styles-scroll-down": {
        if (this.stylesOffset < STYLES_LIST.length - 2) {
          this.stylesOffset++;
          const p =
            panel ??
            (document.querySelector('[data-panel="Home"]') as HTMLElement);
          if (p) this.stylesGroup.refresh(p);
        }
        break;
      }

      // ── Styles preview cards ─────────────────────────────────────
      case "styles-preview-0":
      case "styles-preview-1": {
        if (!editor) break;
        const idx = this.stylesOffset + (cmd === "styles-preview-0" ? 0 : 1);
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
                  editor.replaceSelection(`${s.prefix}${sel || ""}${s.suffix}`);
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
        if (anchor) TagsDropdown.show(anchor, app);
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
            headPrefix: string;
            isBold: boolean;
            isItalic: boolean;
            isUnderline: boolean;
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
        new Notice(
          "Format Painter: select target text then click again to apply",
        );
        break;
      }
    }
  }

  /** Re-evaluate the 3 visible tag-row checkboxes against current line. */
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
