import { App, Notice } from 'obsidian';

const CALLOUT_TYPES = [
  'note', 'abstract', 'info', 'tip', 'success',
  'question', 'warning', 'failure', 'danger', 'bug', 'example', 'quote',
];

export class InsertTab {
  render(container: HTMLElement, app: App): void {
    const panel = container.createDiv();
    panel.addClass('onr-tab-panel');
    panel.setAttribute('data-panel', 'Insert');
    panel.style.display = 'none';
    panel.innerHTML = this.buildHTML();
    this.attachEvents(panel, app);
    container.appendChild(panel);
  }

  private buildHTML(): string {
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
  private insertGroupHTML(): string {
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
  private tablesGroupHTML(): string {
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
  private filesGroupHTML(): string {
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
  private imagesGroupHTML(): string {
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
  private linksGroupHTML(): string {
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
  private timeStampGroupHTML(): string {
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
  private blocksGroupHTML(): string {
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
  private symbolsGroupHTML(): string {
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
  private attachEvents(container: HTMLElement, app: App): void {
    container.querySelectorAll('[data-cmd]').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.executeCommand(el.getAttribute('data-cmd'), app, container);
      });
    });
  }

  private executeCommand(cmd: string | null, app: App, container: HTMLElement): void {
    if (!cmd) return;
    const editor = app.workspace.activeEditor?.editor;

    const insertAtCursor = (text: string, offsetBack = 0) => {
      if (!editor) return;
      const cursor = editor.getCursor();
      editor.replaceRange(text, cursor);
      if (offsetBack > 0) {
        const newLine = cursor.line + text.split('\n').length - 1;
        const lines = text.split('\n');
        const newCh = offsetBack === 0 ? cursor.ch + text.length
          : lines[lines.length - 1].length - offsetBack;
        editor.setCursor({ line: newLine, ch: newCh });
      }
    };

    const fmtDate = (): string => {
      const m = (window as any).moment;
      return m ? m().format('YYYY-MM-DD') : (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      })();
    };

    const fmtTime = (): string => {
      const m = (window as any).moment;
      return m ? m().format('HH:mm') : (() => {
        const d = new Date();
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      })();
    };

    switch (cmd) {
      case 'blank-line':
        insertAtCursor('\n');
        break;

      case 'insert-table': {
        if (!editor) return;
        const table = '\n| col | col | col |\n|---|---|---|\n| | | |\n';
        insertAtCursor(table);
        break;
      }

      case 'attach-file':
      case 'embed-note': {
        if (!editor) return;
        const cursor = editor.getCursor();
        editor.replaceRange('![[]]', cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
        break;
      }

      case 'insert-image': {
        if (!editor) return;
        const cursor = editor.getCursor();
        editor.replaceRange('![[]]', cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
        break;
      }

      case 'insert-video': {
        if (!editor) return;
        const tpl = '\n<iframe src="" width="560" height="315" frameborder="0" allowfullscreen></iframe>\n';
        const cursor = editor.getCursor();
        editor.replaceRange(tpl, cursor);
        break;
      }

      case 'insert-link': {
        if (!editor) return;
        const sel = editor.getSelection();
        const cursor = editor.getCursor();
        if (sel) {
          editor.replaceSelection(`[${sel}]()`);
          const newCursor = editor.getCursor();
          editor.setCursor({ line: newCursor.line, ch: newCursor.ch - 1 });
        } else {
          editor.replaceRange('[]()', cursor);
          editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
        }
        break;
      }

      case 'insert-wikilink': {
        if (!editor) return;
        const cursor = editor.getCursor();
        editor.replaceRange('[[]]', cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
        break;
      }

      case 'insert-date':
        insertAtCursor(fmtDate());
        break;

      case 'insert-time':
        insertAtCursor(fmtTime());
        break;

      case 'insert-datetime':
        insertAtCursor(`${fmtDate()} ${fmtTime()}`);
        break;

      case 'insert-template': {
        const result = app.commands.executeCommandById('insert-template');
        if (!result) {
          new Notice('Enable the Templates or Templater plugin to use this feature');
        }
        break;
      }

      case 'insert-callout':
        this.showCalloutPicker(editor, container);
        break;

      case 'insert-code-block': {
        if (!editor) return;
        const cursor = editor.getCursor();
        const block = '```\n\n```';
        editor.replaceRange(block, cursor);
        editor.setCursor({ line: cursor.line + 1, ch: 0 });
        break;
      }

      case 'insert-math': {
        if (!editor) return;
        const cursor = editor.getCursor();
        editor.replaceRange('$$\n\n$$', cursor);
        editor.setCursor({ line: cursor.line + 1, ch: 0 });
        break;
      }

      case 'insert-hr':
        insertAtCursor('\n---\n');
        break;

      case 'insert-footnote': {
        if (!editor) return;
        const cursor = editor.getCursor();
        editor.replaceRange('[^1]', cursor);
        const lastLine = editor.lastLine();
        const endPos = { line: lastLine, ch: editor.getLine(lastLine).length };
        editor.replaceRange('\n[^1]: ', endPos);
        break;
      }

      case 'insert-tag': {
        if (!editor) return;
        const cursor = editor.getCursor();
        editor.replaceRange('#', cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
        break;
      }
    }
  }

  private showCalloutPicker(editor: any, container: HTMLElement): void {
    // Remove any existing picker
    container.querySelector('.onr-callout-picker')?.remove();

    const picker = document.createElement('div');
    picker.className = 'onr-callout-picker';
    Object.assign(picker.style, {
      position: 'fixed',
      background: '#fff',
      border: '1px solid #c8c6c4',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '4px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2px',
      maxWidth: '260px',
      zIndex: '10000',
    });

    CALLOUT_TYPES.forEach(type => {
      const btn = document.createElement('div');
      btn.textContent = type;
      Object.assign(btn.style, {
        padding: '3px 8px',
        fontSize: '11px',
        cursor: 'pointer',
        borderRadius: '3px',
        border: '1px solid #e1dfdd',
        whiteSpace: 'nowrap',
      });
      btn.addEventListener('mouseenter', () => btn.style.background = '#f0eeec');
      btn.addEventListener('mouseleave', () => btn.style.background = '');
      btn.addEventListener('click', () => {
        picker.remove();
        if (editor) {
          const cursor = editor.getCursor();
          editor.replaceRange(`> [!${type}]\n> `, cursor);
        }
      });
      picker.appendChild(btn);
    });

    // Position below the callout button
    const calloutBtn = container.querySelector('[data-cmd="insert-callout"]') as HTMLElement;
    if (calloutBtn) {
      const rect = calloutBtn.getBoundingClientRect();
      picker.style.top = `${rect.bottom + 4}px`;
      picker.style.left = `${rect.left}px`;
    }

    document.body.appendChild(picker);

    // Close on outside click
    const close = (e: MouseEvent) => {
      if (!picker.contains(e.target as Node)) {
        picker.remove();
        document.removeEventListener('click', close, true);
      }
    };
    setTimeout(() => document.addEventListener('click', close, true), 0);
  }
}
