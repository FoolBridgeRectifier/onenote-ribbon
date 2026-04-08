# Plan: Full React Migration

Convert every vanilla DOM file to React. Business logic (toggleInline, toggleLinePrefix, etc.) stays
as plain `.ts` utilities. Only the rendering layer changes.

---

## Phase 0 — Build Setup

### 0.1 Install deps

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

### 0.2 tsconfig.json — add JSX

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### 0.3 esbuild.config.mjs — enable JSX transform

```js
jsx: 'automatic',
```

No other changes. React and react-dom stay **bundled** (not external).

---

## Phase 1 — AppContext

Every component needs `App`. Pass it through React context instead of prop-drilling.

### 1.1 Create `src/shared/context/AppContext.ts`

```ts
import { createContext, useContext } from 'react';
import { App } from 'obsidian';

export const AppContext = createContext<App>(null!);
export const useApp = () => useContext(AppContext);
```

---

## Phase 2 — Mount point

Replace `RibbonShell`'s manual DOM build with a single React root.

### 2.1 Rewrite `src/ribbon/RibbonShell.ts`

```ts
import { App } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { AppContext } from '../shared/context/AppContext';
import { RibbonApp } from './RibbonApp';

export class RibbonShell {
  private el: HTMLElement;
  private root: Root;

  constructor(private app: App) {}

  mount(): void {
    document.getElementById('onenote-ribbon-root')?.remove();

    this.el = document.createElement('div');
    this.el.id = 'onenote-ribbon-root';

    const hmc = document.querySelector('.horizontal-main-container');
    hmc?.parentElement?.insertBefore(this.el, hmc);

    const titlebar = document.querySelector('.titlebar') as HTMLElement | null;
    if (titlebar) {
      this.el.style.marginTop = `${titlebar.getBoundingClientRect().height}px`;
    }

    this.root = createRoot(this.el);
    this.root.render(
      createElement(AppContext.Provider, { value: this.app },
        createElement(RibbonApp)
      )
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.el?.remove();
  }
}
```

**Why `createElement` here instead of JSX:** `RibbonShell.ts` stays a `.ts` file (it's the Obsidian class boundary). Everything below it is `.tsx`.

### 2.2 Create `src/ribbon/RibbonApp.tsx`

Placeholder to verify the mount works:

```tsx
export function RibbonApp() {
  return <div className="onr-ribbon">loading…</div>;
}
```

**Checkpoint:** Build passes. Reload plugin in Obsidian. "loading…" text appears where the ribbon was.

---

## Phase 3 — Ribbon shell (tab bar + collapse)

### 3.1 Create `src/ribbon/useRibbonState.ts`

```ts
import { useState } from 'react';
import { TABS, TabName } from './tabs';

export function useRibbonState() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  return { activeTab, setActiveTab, collapsed, setCollapsed, pinned, setPinned };
}
```

### 3.2 Create `src/ribbon/tabs.ts`

Centralise the tab name list (was `TABS` const in `RibbonShell.ts`):

```ts
export const TABS = ['Home', 'Insert', 'Draw', 'History', 'Review', 'View', 'Help'] as const;
export type TabName = (typeof TABS)[number];
```

### 3.3 Create `src/ribbon/TabBar.tsx`

```tsx
import { TABS, TabName } from './tabs';

interface Props {
  activeTab: TabName;
  collapsed: boolean;
  pinned: boolean;
  onTabClick: (t: TabName) => void;
  onToggleCollapse: () => void;
}

export function TabBar({ activeTab, collapsed, pinned, onTabClick, onToggleCollapse }: Props) {
  return (
    <div className="onr-tab-bar">
      {TABS.map(t => (
        <div key={t}
          className={`onr-tab${t === activeTab ? ' active' : ''}`}
          onClick={() => onTabClick(t)}>
          {t}
        </div>
      ))}
      <div className="onr-spacer" />
      <div className="onr-pin-btn" onClick={onToggleCollapse}>
        {pinned ? '📌' : ''} {collapsed ? '▼ Expand' : '▲ Collapse'}
      </div>
    </div>
  );
}
```

### 3.4 Update `src/ribbon/RibbonApp.tsx`

```tsx
import { useRibbonState } from './useRibbonState';
import { TabBar } from './TabBar';
import { HomeTabPanel } from '../tabs/home/HomeTabPanel';
import { InsertTabPanel } from '../tabs/insert/InsertTabPanel';

export function RibbonApp() {
  const { activeTab, setActiveTab, collapsed, setCollapsed, pinned, setPinned } = useRibbonState();

  return (
    <div className="onr-ribbon">
      <TabBar
        activeTab={activeTab}
        collapsed={collapsed}
        pinned={pinned}
        onTabClick={setActiveTab}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="onr-body">
          {activeTab === 'Home'   && <HomeTabPanel />}
          {activeTab === 'Insert' && <InsertTabPanel />}
          {/* Draw, History, Review, View, Help: stubs for now */}
        </div>
      )}
    </div>
  );
}
```

**Checkpoint:** Tab bar renders. Clicking tabs switches active highlight. Collapse/expand works.

---

## Phase 4 — Shared components

Create these before porting any tab, as every group uses them.

### 4.1 `src/shared/components/RibbonButton.tsx`

The universal ribbon button. Replaces every `createDiv("onr-btn-sm")` + `addEventListener("click")` pattern.

```tsx
interface Props {
  label?: string;       // text label
  icon?: React.ReactNode; // SVG or emoji
  title?: string;       // tooltip
  active?: boolean;     // applies onr-active class
  disabled?: boolean;
  className?: string;   // defaults to 'onr-btn-sm'
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function RibbonButton({
  label, icon, title, active, disabled,
  className = 'onr-btn-sm', style, onMouseDown, onClick
}: Props) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();   // prevent editor losing focus
    e.stopPropagation();
    onMouseDown?.(e);
  };

  return (
    <div
      className={`${className}${active ? ' onr-active' : ''}${disabled ? ' onr-disabled' : ''}`}
      title={title}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={onClick}
    >
      {icon}
      {label && <span className="onr-btn-label-sm">{label}</span>}
    </div>
  );
}
```

> Note: `onMouseDown` with `preventDefault()` is the React equivalent of the current `mousedown` + `e.preventDefault()` pattern on every button. This must be preserved — it prevents the editor from losing focus when the ribbon is clicked.

### 4.2 `src/shared/components/GroupShell.tsx`

Wraps every group's `<div class="onr-group">` + label:

```tsx
interface Props {
  name: string;
  dataGroup: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function GroupShell({ name, dataGroup, children, style }: Props) {
  return (
    <div className="onr-group" data-group={dataGroup} style={style}>
      {children}
      <div className="onr-group-name">{name}</div>
    </div>
  );
}
```

### 4.3 `src/shared/components/Dropdown.tsx`

Convert `showDropdown()` from an imperative function to a React portal so it renders inside
the React tree and avoids raw `document.createElement`. The `DropdownItem` interface stays in
`src/shared/dropdown/Dropdown.ts` (unchanged) and is imported here.

```tsx
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { DropdownItem, DropdownOpts } from '../dropdown/Dropdown';

interface Props {
  anchor: HTMLElement | null;
  items: DropdownItem[];
  opts?: DropdownOpts;
  onClose: () => void;
}

export function Dropdown({ anchor, items, opts, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    let top = rect.bottom + 2;
    let left = rect.left;
    const mh = items.length > 15 ? 340 : 200;
    if (top + mh > window.innerHeight) top = rect.top - mh - 2;
    if (left + 200 > window.innerWidth) left = window.innerWidth - 204;
    setPos({ top, left });
  }, [anchor]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay so the opening click doesn't immediately close it
    const id = setTimeout(() => document.addEventListener('click', close, true), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', close, true);
    };
  }, [onClose]);

  const bg = opts?.bg ?? '#fff';
  const hoverBg = opts?.hoverBg ?? '#f0eeec';
  const color = opts?.color ?? '#201f1e';
  const needsScroll = items.length > 15;

  return createPortal(
    <div
      ref={menuRef}
      className="onr-overlay-dropdown"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        background: bg,
        color,
        border: '1px solid #c8c6c4',
        borderRadius: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        zIndex: 99999,
        minWidth: 160,
        padding: '2px 0',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: 12,
        ...(needsScroll ? { maxHeight: 340, overflowY: 'auto' } : {}),
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} style={{ borderTop: '1px solid #e1dfdd', margin: '2px 0' }} />
        ) : (
          <DropdownRow key={i} item={item} hoverBg={hoverBg} color={color} onClose={onClose} />
        )
      )}
    </div>,
    document.body
  );
}

function DropdownRow({ item, hoverBg, color, onClose }: {
  item: DropdownItem; hoverBg: string; color: string; onClose: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="onr-dd-item"
      style={{
        padding: '5px 12px',
        cursor: item.disabled ? 'default' : 'pointer',
        color: item.disabled ? '#a19f9d' : color,
        background: hover && !item.disabled ? hoverBg : '',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        ...(item.style ? parseCssString(item.style) : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={e => e.preventDefault()}
      onClick={e => {
        if (item.disabled) return;
        e.stopPropagation();
        onClose();
        item.action();
      }}
    >
      {item.label}
      {item.sublabel && (
        <span style={{ fontSize: 10, color: '#605e5c', marginLeft: 'auto', paddingLeft: 16 }}>
          {item.sublabel}
        </span>
      )}
    </div>
  );
}

// Convert inline CSS string (from existing DropdownItem.style) to React style object
function parseCssString(css: string): React.CSSProperties {
  const result: Record<string, string> = {};
  css.split(';').forEach(rule => {
    const [k, v] = rule.split(':');
    if (k && v) result[k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v.trim();
  });
  return result;
}
```

> `parseCssString` is needed because existing code passes raw CSS strings like `"font-family:Arial;font-size:12px"` as `DropdownItem.style`. This converts them to React style objects without changing any caller.

---

## Phase 5 — useEditorState hook

Replaces the current `requestAnimationFrame` polling + direct DOM class manipulation in `HomeTab.ts`.
Returns derived state so components can use `active` props instead of imperative `classList.toggle`.

### 5.1 Create `src/shared/hooks/useEditorState.ts`

```ts
import { useEffect, useState } from 'react';
import { App } from 'obsidian';
import { STYLES_LIST } from '../../tabs/home/styles/styles-data';

export interface EditorState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  highlight: boolean;
  subscript: boolean;
  superscript: boolean;
  bulletList: boolean;
  numberedList: boolean;
  headLevel: number;        // 0 = no heading, 1–6
  fontFamily: string;
  fontSize: string;
}

const DEFAULT: EditorState = {
  bold: false, italic: false, underline: false,
  strikethrough: false, highlight: false,
  subscript: false, superscript: false,
  bulletList: false, numberedList: false,
  headLevel: 0, fontFamily: '', fontSize: '',
};

export function useEditorState(app: App): EditorState {
  const [state, setState] = useState<EditorState>(DEFAULT);

  useEffect(() => {
    const read = () => {
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) { setState(DEFAULT); return; }

      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      const md = line.replace(/<[^>]+>/g, '');
      const ch = cursor.ch;

      const headMatch = line.match(/^(#{1,6})\s/);

      const inTag = (open: string, close: string) => {
        let p = 0;
        while (p < line.length) {
          const o = line.indexOf(open, p);
          if (o < 0) break;
          const c = line.indexOf(close, o);
          if (c < 0) break;
          if (ch > o + open.length - 1 && ch < c + close.length) return true;
          p = c + close.length;
        }
        return false;
      };

      setState({
        bold:          /\*\*(.*?)\*\*/.test(md),
        italic:        /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(md) || /\*\*\*(.*?)\*\*\*/.test(md),
        underline:     /<u>/.test(line),
        strikethrough: /~~(.*?)~~/.test(md),
        highlight:     /==(.*?)==/.test(md),
        subscript:     inTag('<sub>', '</sub>'),
        superscript:   inTag('<sup>', '</sup>'),
        bulletList:    /^(\s*)- /.test(line),
        numberedList:  /^(\s*)\d+\. /.test(line),
        headLevel:     headMatch ? headMatch[1].length : 0,
        fontFamily:    (app.vault as any).getConfig?.('fontText') ?? '',
        fontSize:      String((app.vault as any).getConfig?.('baseFontSize') ?? ''),
      });
    };

    // Poll on editor interactions
    const onInteract = () => requestAnimationFrame(read);
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.addEventListener('click', onInteract, true);
    ws.addEventListener('keyup', onInteract, true);

    const onLeafChange = () => setTimeout(read, 150);
    const onEditorChange = () => requestAnimationFrame(read);
    const ref1 = app.workspace.on('active-leaf-change', onLeafChange);
    const ref2 = app.workspace.on('editor-change', onEditorChange);

    setTimeout(read, 300);

    return () => {
      ws.removeEventListener('click', onInteract, true);
      ws.removeEventListener('keyup', onInteract, true);
      app.workspace.offref(ref1);
      app.workspace.offref(ref2);
    };
  }, [app]);

  return state;
}
```

### 5.2 Create `src/shared/hooks/useFormatPainter.ts`

Replaces `window._onrFPActive` / `window._onrFP` globals with scoped React state.

```ts
import { useState } from 'react';

export interface FPFormat {
  headPrefix: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export function useFormatPainter() {
  const [active, setActive] = useState(false);
  const [format, setFormat] = useState<FPFormat | null>(null);

  const capture = (fmt: FPFormat) => { setFormat(fmt); setActive(true); };
  const clear   = () => { setFormat(null); setActive(false); };

  return { active, format, capture, clear };
}
```

### 5.3 Create `src/shared/context/FormatPainterContext.ts`

So `ClipboardGroup` can own the FP state while the workspace `mouseup` handler (in `HomeTabPanel`) can also read/reset it:

```ts
import { createContext, useContext } from 'react';
import { FPFormat } from '../hooks/useFormatPainter';

export interface FPContextValue {
  active: boolean;
  format: FPFormat | null;
  capture: (fmt: FPFormat) => void;
  clear: () => void;
}

export const FormatPainterContext = createContext<FPContextValue>(null!);
export const useFP = () => useContext(FormatPainterContext);
```

---

## Phase 6 — Home tab

### 6.1 Create `src/tabs/home/HomeTabPanel.tsx`

Owns editor state, styles offset, and format painter context. Passes them down.

```tsx
import { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { useEditorState } from '../../shared/hooks/useEditorState';
import { useFormatPainter } from '../../shared/hooks/useFormatPainter';
import { FormatPainterContext } from '../../shared/context/FormatPainterContext';
import { STYLES_LIST } from './styles/styles-data';
import { ClipboardGroup } from './clipboard/ClipboardGroup';
import { BasicTextGroup } from './basic-text/BasicTextGroup';
import { StylesGroup } from './styles/StylesGroup';
import { TagsGroup } from './tags/TagsGroup';
import { EmailGroup } from './email/EmailGroup';
import { NavigateGroup } from './navigate/NavigateGroup';
import { applyFormatPainter } from './clipboard/format-painter/applyFormatPainter';

export function HomeTabPanel() {
  const app = useApp();
  const editorState = useEditorState(app);
  const fp = useFormatPainter();
  const [stylesOffset, setStylesOffset] = useState(0);

  // Sync styles offset to current heading level
  useEffect(() => {
    const { headLevel } = editorState;
    if (headLevel >= 1 && headLevel <= 6) {
      const desired = Math.max(0, Math.min(headLevel - 1, STYLES_LIST.length - 2));
      setStylesOffset(desired);
    }
  }, [editorState.headLevel]);

  // Format Painter: auto-apply on drag-select mouseup (OneNote style)
  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      if (!fp.active) return;
      if ((e.target as Element)?.closest('[data-cmd]')) return;
      requestAnimationFrame(() => {
        const editor = app.workspace.activeEditor?.editor;
        const sel = editor?.getSelection();
        fp.clear();
        if (!fp.format || !editor || !sel) return;
        applyFormatPainter(editor, sel, fp.format);
      });
    };
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.addEventListener('mouseup', onMouseUp, true);
    return () => ws.removeEventListener('mouseup', onMouseUp, true);
  }, [app, fp]);

  return (
    <FormatPainterContext.Provider value={fp}>
      <div className="onr-tab-panel" data-panel="Home">
        <ClipboardGroup />
        <BasicTextGroup editorState={editorState} />
        <StylesGroup
          editorState={editorState}
          stylesOffset={stylesOffset}
          setStylesOffset={setStylesOffset}
        />
        <TagsGroup editorState={editorState} />
        <EmailGroup />
        <NavigateGroup />
      </div>
    </FormatPainterContext.Provider>
  );
}
```

### 6.2 Create `src/tabs/home/clipboard/format-painter/applyFormatPainter.ts`

Extract the apply logic (currently duplicated between `HomeTab.ts` and `FormatPainterButton.ts`) into a single pure function:

```ts
import { Editor } from 'obsidian';
import { FPFormat } from '../../../../shared/hooks/useFormatPainter';

export function applyFormatPainter(editor: Editor, selection: string, fmt: FPFormat): void {
  let result = selection;
  if (fmt.isUnderline) result = `<u>${result}</u>`;
  if (fmt.isItalic)    result = `*${result}*`;
  if (fmt.isBold)      result = `**${result}**`;
  editor.replaceSelection(result);
  if (fmt.headPrefix) {
    const cursor = editor.getCursor();
    const line   = editor.getLine(cursor.line);
    if (!line.startsWith(fmt.headPrefix)) {
      editor.setLine(cursor.line, fmt.headPrefix + line.replace(/^#{1,6}\s+/, ''));
    }
  }
}
```

### 6.3 Port ClipboardGroup — `src/tabs/home/clipboard/ClipboardGroup.tsx`

```tsx
import { useApp } from '../../../shared/context/AppContext';
import { useFP } from '../../../shared/context/FormatPainterContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';
import { Dropdown } from '../../../shared/components/Dropdown';
import { useState, useRef } from 'react';
import { Notice } from 'obsidian';
import { applyFormatPainter } from './format-painter/applyFormatPainter';

export function ClipboardGroup() {
  const app = useApp();
  const fp = useFP();
  const [pasteMenuAnchor, setPasteMenuAnchor] = useState<HTMLElement | null>(null);
  const pasteAnchorRef = useRef<HTMLDivElement>(null);

  const editor = () => app.workspace.activeEditor?.editor;

  const paste = () => navigator.clipboard.readText().then(t => editor()?.replaceSelection(t));
  const cut   = () => {
    const sel = editor()?.getSelection();
    if (sel) navigator.clipboard.writeText(sel).then(() => editor()?.replaceSelection(''));
  };
  const copy  = () => {
    const sel = editor()?.getSelection();
    if (sel) navigator.clipboard.writeText(sel);
  };

  const onFormatPainterClick = () => {
    const ed = editor();
    if (!ed) return;
    if (fp.active) {
      const sel = ed.getSelection();
      if (fp.format && sel) {
        applyFormatPainter(ed, sel, fp.format);
        fp.clear();
      } else if (fp.format && !sel) {
        new Notice('Format Painter: select text first, then click again');
        // Keep active
      }
      return;
    }
    // Phase 1: capture
    const cursor = ed.getCursor();
    const line   = ed.getLine(cursor.line);
    const src    = ed.getSelection() || line;
    fp.capture({
      headPrefix: line.match(/^(#{1,6} )/)?.[0] ?? '',
      isBold:     /\*\*(.*?)\*\*/.test(src),
      isItalic:   /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(src),
      isUnderline: /<u>/.test(src),
    });
    new Notice('Format Painter: select target text then click again to apply');
  };

  const pasteMenuItems = [
    { label: 'Paste', sublabel: 'Ctrl+V', action: paste },
    {
      label: 'Paste as Plain Text', sublabel: 'Ctrl+Shift+V',
      action: () => navigator.clipboard.readText().then(t => {
        editor()?.replaceSelection(t.replace(/<[^>]+>/g, '').replace(/\r\n/g, '\n'));
      }),
    },
    { label: 'Paste Special…', disabled: true, action: () => {} },
  ];

  return (
    <GroupShell name="Clipboard" dataGroup="Clipboard">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Big paste column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <RibbonButton
            label="Paste" className="onr-btn-lg" data-cmd="paste"
            onClick={paste}
          />
          <div ref={pasteAnchorRef}>
            <RibbonButton
              label="▾" className="onr-btn-sm"
              style={{ width: 14, fontSize: 9 }}
              onClick={() => setPasteMenuAnchor(pasteAnchorRef.current)}
            />
          </div>
        </div>

        {/* Small stacked column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 2 }}>
          <RibbonButton label="✂ Cut"  data-cmd="cut"  onClick={cut} />
          <RibbonButton label="⎘ Copy" data-cmd="copy" onClick={copy} />
          <RibbonButton
            icon={<FormatPainterIcon />}
            label="Format Painter"
            data-cmd="format-painter"
            active={fp.active}
            style={{ width: 68, flexDirection: 'row', gap: 4, padding: '2px 4px' }}
            onClick={onFormatPainterClick}
          />
        </div>
      </div>

      {pasteMenuAnchor && (
        <Dropdown
          anchor={pasteMenuAnchor}
          items={pasteMenuItems}
          onClose={() => setPasteMenuAnchor(null)}
        />
      )}
    </GroupShell>
  );
}

function FormatPainterIcon() {
  return (
    <svg className="onr-icon-sm" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  );
}
```

### 6.4 Port BasicTextGroup — `src/tabs/home/basic-text/BasicTextGroup.tsx`

```tsx
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';
import { Dropdown } from '../../../shared/components/Dropdown';
import { EditorState } from '../../../shared/hooks/useEditorState';
import { toggleInline } from '../../../shared/toggleInline';
import { toggleSubSup } from '../../../shared/toggleSubSup';
import { toggleLinePrefix } from '../../../shared/toggleLinePrefix';
import { Notice } from 'obsidian';
import { useState, useRef } from 'react';

interface Props { editorState: EditorState }

export function BasicTextGroup({ editorState }: Props) {
  const app = useApp();
  const ed = () => app.workspace.activeEditor?.editor;
  const exec = (id: string) => app.commands.executeCommandById(id);

  const [fontAnchor, setFontAnchor] = useState<HTMLElement | null>(null);
  const [sizeAnchor, setSizeAnchor] = useState<HTMLElement | null>(null);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [alignAnchor, setAlignAnchor] = useState<HTMLElement | null>(null);
  const fontRef  = useRef<HTMLDivElement>(null);
  const sizeRef  = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const alignRef = useRef<HTMLDivElement>(null);

  const clearFormatting = (inline = false) => {
    const e = ed(); if (!e) return;
    const hasSel = !!e.getSelection();
    const raw = hasSel ? e.getSelection() : e.getLine(e.getCursor().line);
    let cleaned = raw
      .replace(/\*\*(.*?)\*\*/gs, '$1')
      .replace(/\*(.*?)\*/gs, '$1')
      .replace(/_(.*?)_/gs, '$1')
      .replace(/~~(.*?)~~/gs, '$1')
      .replace(/==(.*?)==/gs, '$1')
      .replace(/`(.*?)`/gs, '$1')
      .replace(/<\/?[^>]+(>|$)/g, '');
    if (!inline) cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
    if (hasSel) e.replaceSelection(cleaned);
    else e.setLine(e.getCursor().line, cleaned);
  };

  const FONTS = ['Segoe UI','Arial','Calibri','Cambria','Consolas','Courier New',
    'Georgia','Helvetica','Times New Roman','Trebuchet MS','Verdana','Comic Sans MS'];
  const SIZES = [8,9,10,11,12,14,16,18,20,22,24,28,32,36,48,72];
  const COLORS = [
    { label:'Black',   hex:'#000000' }, { label:'Dark Red', hex:'#C00000' },
    { label:'Red',     hex:'#FF0000' }, { label:'Orange',   hex:'#FF6600' },
    { label:'Yellow',  hex:'#FFFF00' }, { label:'Green',    hex:'#00B050' },
    { label:'Blue',    hex:'#0070C0' }, { label:'Purple',   hex:'#7030A0' },
    { label:'White',   hex:'#FFFFFF' }, { label:'Gray',     hex:'#808080' },
  ];

  return (
    <GroupShell name="Basic Text" dataGroup="Basic Text">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Row 1: font pickers + list + indent + clear */}
        <div className="onr-row" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '2px 0 0 0' }}>
          <div ref={fontRef}>
            <RibbonButton
              label={editorState.fontFamily || 'Font'} data-cmd="font-family"
              style={{ minWidth: 80 }}
              onClick={() => setFontAnchor(fontRef.current)}
            />
          </div>
          <div ref={sizeRef}>
            <RibbonButton
              label={editorState.fontSize || 'Size'} data-cmd="font-size"
              style={{ minWidth: 36 }}
              onClick={() => setSizeAnchor(sizeRef.current)}
            />
          </div>
          <RibbonButton label="• List"   data-cmd="bullet-list"   active={editorState.bulletList}   onClick={() => ed() && toggleLinePrefix(ed()!, '- ')} />
          <RibbonButton label="1. List"  data-cmd="numbered-list" active={editorState.numberedList} onClick={() => ed() && toggleLinePrefix(ed()!, '1. ')} />
          <RibbonButton label="⇤ Out"   data-cmd="outdent"  onClick={() => exec('editor:unindent-list')} />
          <RibbonButton label="⇥ In"    data-cmd="indent"   onClick={() => exec('editor:indent-list')} />
          <RibbonButton label="🧹 Clear" data-cmd="clear-formatting" onClick={() => clearFormatting(false)} />
        </div>

        {/* Row 2: inline + color + align */}
        <div className="onr-row" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonButton label="B"  data-cmd="bold"          active={editorState.bold}          style={{ fontWeight: 'bold' }}   onClick={() => ed() && toggleInline(ed()!, '**')} />
          <RibbonButton label="I"  data-cmd="italic"        active={editorState.italic}        style={{ fontStyle: 'italic' }}  onClick={() => ed() && toggleInline(ed()!, '*')} />
          <RibbonButton label="U"  data-cmd="underline"     active={editorState.underline}     style={{ textDecoration: 'underline' }} onClick={() => ed() && toggleInline(ed()!, '<u>', '</u>')} />
          <RibbonButton label="S̶"  data-cmd="strikethrough" active={editorState.strikethrough} onClick={() => ed() && toggleInline(ed()!, '~~')} />
          <RibbonButton label="x₂" data-cmd="subscript"    active={editorState.subscript}    onClick={() => ed() && toggleSubSup(ed()!, 'sub')} />
          <RibbonButton label="x²" data-cmd="superscript"  active={editorState.superscript}  onClick={() => ed() && toggleSubSup(ed()!, 'sup')} />

          <div style={{ width: 1, height: 18, background: '#d0d0d0', margin: '0 1px', flexShrink: 0 }} />

          <RibbonButton label="H̲" data-cmd="highlight" active={editorState.highlight} onClick={() => ed() && toggleInline(ed()!, '==')} />
          <div ref={colorRef}>
            <RibbonButton label="A" data-cmd="font-color" onClick={() => setColorAnchor(colorRef.current)} />
          </div>

          <div style={{ width: 1, height: 18, background: '#d0d0d0', margin: '0 1px', flexShrink: 0 }} />

          <div ref={alignRef}>
            <RibbonButton label="⇔" data-cmd="align" onClick={() => setAlignAnchor(alignRef.current)} />
          </div>
          <RibbonButton label="A̶" data-cmd="clear-inline" onClick={() => clearFormatting(true)} />
        </div>
      </div>

      {fontAnchor && (
        <Dropdown anchor={fontAnchor}
          items={FONTS.map(f => ({
            label: f, style: `font-family:${f};font-size:12px`,
            action: () => {
              const e = ed();
              if (!e) return;
              const sel = e.getSelection();
              if (sel) e.replaceSelection(`<span style="font-family:${f}">${sel}</span>`);
              else { (app.vault as any).setConfig('fontText', f); app.workspace.trigger('css-change'); }
            },
          }))}
          onClose={() => setFontAnchor(null)}
        />
      )}
      {sizeAnchor && (
        <Dropdown anchor={sizeAnchor}
          items={SIZES.map(s => ({
            label: `${s}`,
            action: () => {
              const e = ed();
              if (!e) return;
              const sel = e.getSelection();
              if (sel) e.replaceSelection(`<span style="font-size:${s}px">${sel}</span>`);
              else { (app.vault as any).setConfig('baseFontSize', s); app.workspace.trigger('css-change'); }
            },
          }))}
          onClose={() => setSizeAnchor(null)}
        />
      )}
      {colorAnchor && (
        <Dropdown anchor={colorAnchor}
          items={COLORS.map(c => ({
            label: c.label, style: `color:${c.hex}${c.hex === '#FFFFFF' ? ';background:#333' : ''}`,
            action: () => {
              const sel = ed()?.getSelection();
              if (sel) ed()?.replaceSelection(`<span style="color:${c.hex}">${sel}</span>`);
            },
          }))}
          onClose={() => setColorAnchor(null)}
        />
      )}
      {alignAnchor && (
        <Dropdown anchor={alignAnchor}
          items={[
            { label: '⇐  Align Left',  sublabel: 'Ctrl+L', action: () => applyAlign(ed(), 'left') },
            { label: '⇔  Center',       sublabel: 'Ctrl+E', action: () => applyAlign(ed(), 'center') },
            { label: '⇒  Align Right',  sublabel: 'Ctrl+R', action: () => applyAlign(ed(), 'right') },
            { label: '⇔  Justify',      sublabel: 'Ctrl+J', action: () => applyAlign(ed(), 'justify') },
          ]}
          onClose={() => setAlignAnchor(null)}
        />
      )}
    </GroupShell>
  );
}

function applyAlign(editor: any, align: string) {
  if (!editor) { new Notice('No active editor'); return; }
  const sel = editor.getSelection();
  if (sel) editor.replaceSelection(`<div style="text-align:${align}">\n\n${sel}\n\n</div>`);
  else {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    editor.setLine(cursor.line, `<div style="text-align:${align}">${line}</div>`);
  }
}
```

### 6.5 Port StylesGroup — `src/tabs/home/styles/StylesGroup.tsx`

```tsx
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';
import { Dropdown } from '../../../shared/components/Dropdown';
import { EditorState } from '../../../shared/hooks/useEditorState';
import { STYLES_LIST } from './styles-data';
import { toggleLinePrefix } from '../../../shared/toggleLinePrefix';
import { useState, useRef } from 'react';

interface Props {
  editorState: EditorState;
  stylesOffset: number;
  setStylesOffset: (v: number) => void;
}

export function StylesGroup({ editorState, stylesOffset, setStylesOffset }: Props) {
  const app = useApp();
  const ed = () => app.workspace.activeEditor?.editor;
  const [dropAnchor, setDropAnchor] = useState<HTMLElement | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const applyStyle = (idx: number) => {
    const e = ed(); if (!e) return;
    const s = STYLES_LIST[idx]; if (!s) return;
    const cursor = e.getCursor();
    const line   = e.getLine(cursor.line);
    const stripped = line.replace(/^#{1,6}\s+/, '');
    if (s.prefix) {
      if (line === s.prefix + stripped) e.setLine(cursor.line, stripped);
      else e.setLine(cursor.line, s.prefix + stripped);
    } else {
      e.setLine(cursor.line, stripped);
    }
  };

  const isActiveStyle = (idx: number) => {
    const s = STYLES_LIST[idx]; if (!s) return false;
    const { headLevel } = editorState;
    return (headLevel > 0 && s.prefix === '#'.repeat(headLevel) + ' ')
        || (headLevel === 0 && s.label === 'Normal');
  };

  const dropItems = [
    ...STYLES_LIST.map((s, i) => ({
      label: s.label, style: s.style + ';padding:4px 12px',
      action: () => applyStyle(i),
    })),
    { label: '', divider: true as const, action: () => {} },
    {
      label: '🧹  Clear Formatting', style: 'font-size:11px;color:#e0e0e0',
      action: () => {
        const e = ed(); if (!e) return;
        const hasSel = !!e.getSelection();
        const raw = hasSel ? e.getSelection() : e.getLine(e.getCursor().line);
        const cleaned = raw
          .replace(/^#{1,6}\s+/gm, '').replace(/\*\*(.*?)\*\*/gs, '$1')
          .replace(/\*(.*?)\*/gs, '$1').replace(/_(.*?)_/gs, '$1')
          .replace(/~~(.*?)~~/gs, '$1').replace(/==(.*?)==/gs, '$1')
          .replace(/`(.*?)`/gs, '$1').replace(/<\/?[^>]+(>|$)/g, '');
        if (hasSel) e.replaceSelection(cleaned);
        else e.setLine(e.getCursor().line, cleaned);
      },
    },
  ];

  return (
    <GroupShell name="Styles" dataGroup="Styles">
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {/* Two preview cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 130 }}>
          {[0, 1].map(i => {
            const s = STYLES_LIST[stylesOffset + i];
            return s ? (
              <div key={i}
                className={`onr-btn-sm${isActiveStyle(stylesOffset + i) ? ' onr-active' : ''}`}
                data-cmd={`styles-preview-${i}`}
                style={{ width: 130, minHeight: 28, background: '#1a1a2e', border: '1px solid #555', borderRadius: 2, flexDirection: 'row', justifyContent: 'flex-start', padding: '2px 8px' }}
                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => applyStyle(stylesOffset + i)}
              >
                <span style={parseCssString(s.style)}>{s.label}</span>
              </div>
            ) : null;
          })}
        </div>

        {/* Scroll + dropdown column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <RibbonButton label="▲" data-cmd="styles-scroll-up"
            style={{ width: 16, fontSize: 9, padding: 0 }}
            onClick={() => setStylesOffset(Math.max(0, stylesOffset - 1))}
          />
          <div ref={dropRef}>
            <RibbonButton label="▾" data-cmd="styles-dropdown"
              style={{ width: 16, fontSize: 9, padding: 0 }}
              onClick={() => setDropAnchor(dropRef.current)}
            />
          </div>
          <RibbonButton label="▼" data-cmd="styles-scroll-down"
            style={{ width: 16, fontSize: 9, padding: 0 }}
            onClick={() => setStylesOffset(Math.min(STYLES_LIST.length - 2, stylesOffset + 1))}
          />
        </div>
      </div>

      {dropAnchor && (
        <Dropdown anchor={dropAnchor} items={dropItems}
          opts={{ bg: '#1a1a2e', hoverBg: '#2a2a4e', color: '#e0e0e0' }}
          onClose={() => setDropAnchor(null)}
        />
      )}
    </GroupShell>
  );
}

// Reuse from Dropdown.tsx or inline here
function parseCssString(css: string): React.CSSProperties {
  const result: Record<string, string> = {};
  css.split(';').forEach(rule => {
    const [k, v] = rule.split(':');
    if (k && v) result[k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v.trim();
  });
  return result;
}
```

### 6.6 Port TagsGroup — `src/tabs/home/tags/TagsGroup.tsx`

```tsx
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';
import { Dropdown } from '../../../shared/components/Dropdown';
import { EditorState } from '../../../shared/hooks/useEditorState';
import { ALL_TAGS, tagNotation } from './tags-data';
import { applyTag } from './tag-apply/applyTag';
import { toggleLinePrefix } from '../../../shared/toggleLinePrefix';
import { useState, useRef } from 'react';

interface Props { editorState: EditorState }

export function TagsGroup({ editorState: _ }: Props) {
  const app = useApp();
  const ed = () => app.workspace.activeEditor?.editor;
  const [ddAnchor, setDdAnchor] = useState<HTMLElement | null>(null);
  const ddRef = useRef<HTMLDivElement>(null);

  const top3 = ALL_TAGS.slice(0, 3);

  const isTagActive = (cmd: string) => {
    const e = ed(); if (!e) return false;
    const line = e.getLine(e.getCursor().line);
    const notation = tagNotation(cmd);
    return !!notation && line.includes(notation.split('\n')[0].trim());
  };

  // Build TagsDropdown items from ALL_TAGS
  const ddItems = ALL_TAGS.map(tag => ({
    label: tag.label,
    action: () => { const e = ed(); if (e) applyTag(tag.cmd, e); },
  }));

  return (
    <GroupShell name="Tags" dataGroup="Tags">
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* Tag rows column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, width: 150 }}>
          {top3.map(tag => {
            const active = isTagActive(tag.cmd);
            return (
              <div key={tag.cmd} className="onr-tag-row onr-btn-sm" data-cmd={tag.cmd}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => { const e = ed(); if (e) applyTag(tag.cmd, e); }}
              >
                <div className="onr-tag-check" style={{
                  width: 12, height: 12, border: '1px solid #888',
                  borderRadius: 2, flexShrink: 0,
                  background: active ? '#4472C4' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && (
                    <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }}>
                      <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                  )}
                </div>
                <span>{tag.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dropdown arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 64 }}>
          <div ref={ddRef}>
            <RibbonButton label="▾" data-cmd="tags-dropdown"
              style={{ width: 14, minHeight: 64, padding: 0, fontSize: 9, justifyContent: 'center' }}
              onClick={() => setDdAnchor(ddRef.current)}
            />
          </div>
        </div>

        {/* Big buttons */}
        <RibbonButton label="☐ Todo" data-cmd="todo-tag"
          onClick={() => ed() && toggleLinePrefix(ed()!, '- [ ] ')}
        />
        <RibbonButton label="🔍 Find Tags" data-cmd="find-tags"
          onClick={() => {
            app.commands.executeCommandById('global-search:open');
            setTimeout(() => {
              const input = document.querySelector('.search-input-container input') as HTMLInputElement;
              if (input) { input.value = '#'; input.dispatchEvent(new Event('input')); }
            }, 300);
          }}
        />
      </div>

      {ddAnchor && (
        <Dropdown anchor={ddAnchor} items={ddItems} onClose={() => setDdAnchor(null)} />
      )}
    </GroupShell>
  );
}
```

### 6.7 Port EmailGroup — `src/tabs/home/email/EmailGroup.tsx`

```tsx
import { Notice } from 'obsidian';
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';

export function EmailGroup() {
  const app = useApp();
  const ed = () => app.workspace.activeEditor?.editor;

  const emailPage = () => {
    const content = ed()?.getValue() ?? '';
    navigator.clipboard.writeText(content)
      .then(() => new Notice('Page content copied to clipboard'));
  };

  const meetingDetails = () => {
    const e = ed(); if (!e) return;
    const now = new Date();
    const tmpl = `---\nDate: ${now.toLocaleDateString()}\nTime: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nAttendees: \nAgenda: \n---\n\n`;
    e.replaceRange(tmpl, e.getCursor());
  };

  return (
    <GroupShell name="Email" dataGroup="Email">
      <RibbonButton label="📧 Email Page"      data-cmd="email-page"      onClick={emailPage} />
      <RibbonButton label="📋 Meeting Details" data-cmd="meeting-details" onClick={meetingDetails} />
    </GroupShell>
  );
}
```

### 6.8 Port NavigateGroup — `src/tabs/home/navigate/NavigateGroup.tsx`

```tsx
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';

export function NavigateGroup() {
  const app = useApp();
  const exec = (id: string) => app.commands.executeCommandById(id);

  return (
    <GroupShell name="Navigate" dataGroup="Navigate">
      <RibbonButton label="📋 Outline"   data-cmd="outline"    onClick={() => exec('outline:open')} />
      <RibbonButton label="⊟ Fold All"   data-cmd="fold-all"   onClick={() => exec('editor:fold-all')} />
      <RibbonButton label="⊞ Unfold All" data-cmd="unfold-all" onClick={() => exec('editor:unfold-all')} />
    </GroupShell>
  );
}
```

**Checkpoint:** Full Home tab renders and all buttons work exactly as before.

---

## Phase 7 — Insert tab

### 7.1 Create `src/tabs/insert/InsertTabPanel.tsx`

```tsx
import { GroupShell } from '../../shared/components/GroupShell';
import { RibbonButton } from '../../shared/components/RibbonButton';
import { useApp } from '../../shared/context/AppContext';
import { BlankLineButton } from './blank-line/BlankLineButton';
import { TablesGroup } from './tables/TablesGroup';
import { FilesGroup } from './files/FilesGroup';
import { ImagesGroup } from './images/ImagesGroup';
import { LinksGroup } from './links/LinksGroup';
import { TimestampGroup } from './timestamp/TimestampGroup';
import { BlocksGroup } from './blocks/BlocksGroup';
import { SymbolsGroup } from './symbols/SymbolsGroup';

export function InsertTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="Insert">
      <GroupShell name="Insert" dataGroup="Insert">
        <div className="onr-group-buttons">
          <BlankLineButton />
        </div>
      </GroupShell>
      <TablesGroup />
      <FilesGroup />
      <ImagesGroup />
      <LinksGroup />
      <TimestampGroup />
      <BlocksGroup />
      <SymbolsGroup />
    </div>
  );
}
```

### 7.2 Port each Insert group

Same pattern as Home tab groups. Each group file `FooGroup.ts` → `FooGroup.tsx`:

1. Replace `container.createDiv("onr-group")` + `new XButton().render()` with `<GroupShell>` + `<RibbonButton>`.
2. Replace `addEventListener("click")` with `onClick` prop.
3. Replace `addEventListener("mousedown", e => e.preventDefault())` — handled by `RibbonButton` automatically.
4. Import `useApp()` instead of receiving `app` as a parameter.

**Insert groups to port (8 total):**

| File | What it contains |
|------|-----------------|
| `blank-line/BlankLineButton.ts` | Single insert-blank-line button |
| `tables/TablesGroup.ts` | Table insertion buttons |
| `files/FilesGroup.ts` | File link / embed buttons |
| `images/ImagesGroup.ts` | Image embed buttons |
| `links/LinksGroup.ts` | Link insertion buttons |
| `timestamp/TimestampGroup.ts` | Date/time insertion buttons |
| `blocks/BlocksGroup.ts` | Callout / code block / quote buttons |
| `symbols/SymbolsGroup.ts` | Symbol/emoji insertion |

Each follows the same conversion recipe — no new patterns needed.

---

## Phase 8 — Delete old vanilla files

After all groups are ported and verified:

| File to delete | Replaced by |
|----------------|-------------|
| `src/ribbon/RibbonShell.ts` old `buildHTML()` + `attachEvents()` + `syncPanelVisibility()` | `RibbonApp.tsx` + `TabBar.tsx` |
| `src/tabs/home/HomeTab.ts` | `HomeTabPanel.tsx` |
| `src/tabs/insert/InsertTab.ts` | `InsertTabPanel.tsx` |
| `src/tabs/home/clipboard/ClipboardGroup.ts` | `ClipboardGroup.tsx` |
| `src/tabs/home/clipboard/format-painter/FormatPainterButton.ts` | inline in `ClipboardGroup.tsx` |
| `src/tabs/home/clipboard/paste/PasteButton.ts` | inline in `ClipboardGroup.tsx` |
| `src/tabs/home/clipboard/paste-dropdown/PasteDropdown.ts` | inline in `ClipboardGroup.tsx` |
| `src/tabs/home/clipboard/cut/CutButton.ts` | inline in `ClipboardGroup.tsx` |
| `src/tabs/home/clipboard/copy/CopyButton.ts` | inline in `ClipboardGroup.tsx` |
| `src/tabs/home/basic-text/BasicTextGroup.ts` + all 17 button `.ts` files | `BasicTextGroup.tsx` |
| `src/tabs/home/styles/StylesGroup.ts` + sub-files | `StylesGroup.tsx` |
| `src/tabs/home/tags/TagsGroup.ts` + sub-files | `TagsGroup.tsx` |
| `src/tabs/home/email/EmailGroup.ts` + sub-files | `EmailGroup.tsx` |
| `src/tabs/home/navigate/NavigateGroup.ts` + sub-files | `NavigateGroup.tsx` |
| All 8 Insert group `.ts` files + button `.ts` files | their `.tsx` replacements |

**Keep unchanged (pure logic, no DOM):**
- `src/shared/toggleInline.ts`
- `src/shared/toggleSubSup.ts`
- `src/shared/toggleLinePrefix.ts`
- `src/shared/dropdown/Dropdown.ts` (type definitions only — `showDropdown` function can be deleted once all callers are ported)
- `src/tabs/home/styles/styles-data.ts`
- `src/tabs/home/tags/tags-data.ts`
- `src/tabs/home/tags/tag-apply/applyTag.ts`
- `src/tabs/home/tags/tags-dropdown/TagsDropdown.ts` (if it has its own logic; otherwise inline)

---

## Phase 9 — Stub tabs

Replace the empty stub panels with proper React components so future tab work has a home:

```tsx
// src/tabs/draw/DrawTabPanel.tsx
export function DrawTabPanel() {
  return <div className="onr-tab-panel" data-panel="Draw"><em>Draw — coming soon</em></div>;
}
// same for History, Review, View, Help
```

Wire them into `RibbonApp.tsx`:

```tsx
{activeTab === 'Draw'    && <DrawTabPanel />}
{activeTab === 'History' && <HistoryTabPanel />}
// etc.
```

---

## Complete file map after migration

```
src/
├── main.ts                              (unchanged)
├── ribbon/
│   ├── RibbonShell.ts                  (rewritten: only createRoot + DOM insert)
│   ├── RibbonApp.tsx                   (NEW)
│   ├── TabBar.tsx                      (NEW)
│   ├── tabs.ts                         (NEW — TABS const + TabName type)
│   └── useRibbonState.ts               (NEW)
├── shared/
│   ├── context/
│   │   ├── AppContext.ts               (NEW)
│   │   └── FormatPainterContext.ts     (NEW)
│   ├── components/
│   │   ├── RibbonButton.tsx            (NEW)
│   │   ├── GroupShell.tsx              (NEW)
│   │   └── Dropdown.tsx                (NEW — React portal)
│   ├── hooks/
│   │   ├── useEditorState.ts           (NEW)
│   │   └── useFormatPainter.ts         (NEW)
│   ├── dropdown/Dropdown.ts            (kept for DropdownItem type)
│   ├── toggleInline.ts                 (unchanged)
│   ├── toggleSubSup.ts                 (unchanged)
│   └── toggleLinePrefix.ts             (unchanged)
├── tabs/
│   ├── home/
│   │   ├── HomeTabPanel.tsx            (NEW — replaces HomeTab.ts)
│   │   ├── clipboard/
│   │   │   ├── ClipboardGroup.tsx      (NEW)
│   │   │   └── format-painter/
│   │   │       └── applyFormatPainter.ts (NEW — extracted logic)
│   │   ├── basic-text/
│   │   │   └── BasicTextGroup.tsx      (NEW — replaces group + all 17 buttons)
│   │   ├── styles/
│   │   │   ├── StylesGroup.tsx         (NEW)
│   │   │   └── styles-data.ts          (unchanged)
│   │   ├── tags/
│   │   │   ├── TagsGroup.tsx           (NEW)
│   │   │   ├── tags-data.ts            (unchanged)
│   │   │   └── tag-apply/applyTag.ts  (unchanged)
│   │   ├── email/
│   │   │   └── EmailGroup.tsx          (NEW)
│   │   └── navigate/
│   │       └── NavigateGroup.tsx       (NEW)
│   └── insert/
│       ├── InsertTabPanel.tsx           (NEW — replaces InsertTab.ts)
│       ├── blank-line/BlankLineButton.tsx
│       ├── tables/TablesGroup.tsx
│       ├── files/FilesGroup.tsx
│       ├── images/ImagesGroup.tsx
│       ├── links/LinksGroup.tsx
│       ├── timestamp/TimestampGroup.tsx
│       ├── blocks/BlocksGroup.tsx
│       └── symbols/SymbolsGroup.tsx
```

---

## Key React patterns used throughout

| Old pattern | React replacement |
|-------------|-------------------|
| `container.createDiv("onr-btn-sm")` | `<RibbonButton>` component |
| `btn.addEventListener("mousedown", e => e.preventDefault())` | Built into `RibbonButton.onMouseDown` |
| `btn.addEventListener("click", handler)` | `onClick` prop |
| `btn.classList.toggle("onr-active", bool)` | `active={bool}` prop on `RibbonButton` |
| `btn.style.display = "none"` | Conditional render `{condition && <Component />}` |
| `document.getElementById("onr-font-label").textContent = f` | `editorState.fontFamily` from `useEditorState` |
| `window._onrFPActive` / `window._onrFP` | `useFormatPainter()` hook + `FormatPainterContext` |
| `showDropdown(anchor, items)` (imperative) | `{anchor && <Dropdown anchor={anchor} items={items} />}` |
| `this.stylesOffset` mutable instance field | `const [stylesOffset, setStylesOffset] = useState(0)` |
| `requestAnimationFrame` polling + `classList.toggle` | `useEditorState` hook → `active` props |
| `app.workspace.on(...)` lifecycle in render method | `useEffect` with cleanup returning `app.workspace.offref` |
| `setTimeout(() => read(), 300)` for initial state | `useEffect` with `setTimeout(read, 300)` + cleanup |
| Prop-drilling `app` through every constructor | `useApp()` from `AppContext` |

---

## Execution order

1. **Phase 0** — deps + tsconfig + esbuild (10 min)
2. **Phase 1** — AppContext (5 min)
3. **Phase 2** — Mount point, placeholder RibbonApp (20 min) → **checkpoint**
4. **Phase 3** — TabBar + useRibbonState (30 min) → **checkpoint**
5. **Phase 4** — Shared components: RibbonButton, GroupShell, Dropdown (1 hr)
6. **Phase 5** — useEditorState + useFormatPainter + FormatPainterContext (1 hr)
7. **Phase 6** — Home tab, group by group (3–4 hr) → **checkpoint**
8. **Phase 7** — Insert tab, group by group (2–3 hr) → **checkpoint**
9. **Phase 8** — Delete old `.ts` files (30 min)
10. **Phase 9** — Stub remaining tabs (20 min)

---

## Done criteria

- [ ] `npm run build` produces zero TypeScript errors
- [ ] No `.ts` file in `src/tabs/` or `src/ribbon/` uses `createDiv`, `createEl`, or `addEventListener` directly
- [ ] No `window._onr*` globals exist anywhere
- [ ] No `showDropdown()` imperative calls remain (all replaced by `<Dropdown>`)
- [ ] All Home tab buttons behave identically to pre-migration
- [ ] All Insert tab buttons behave identically to pre-migration
- [ ] Plugin loads cleanly in Obsidian; `onunload` calls `root.unmount()` with no React warnings in console
- [ ] Active-state indicators (bold, italic, heading) update correctly on cursor movement
- [ ] Format Painter works end-to-end (capture → apply, drag-select auto-apply)
- [ ] Collapse/expand and tab switching work
