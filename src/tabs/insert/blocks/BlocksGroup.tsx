import { useState, useRef } from 'react';
import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';
import { Dropdown } from '../../../shared/components/Dropdown';

const CALLOUT_TYPES = [
  'note', 'abstract', 'info', 'tip', 'success', 'question',
  'warning', 'failure', 'danger', 'bug', 'example', 'quote',
];

export function BlocksGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;
  const [calloutAnchor, setCalloutAnchor] = useState<HTMLElement | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  const insertCallout = (type: string) => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange(`> [!${type}]\n> `, editor.getCursor());
  };

  const insertTemplate = () => {
    const result = (app as any).commands.executeCommandById('insert-template');
    if (!result) new Notice('Enable the Templates or Templater plugin to use this feature');
  };

  const insertCodeBlock = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange('```\n\n```', cursor);
    editor.setCursor({ line: cursor.line + 1, ch: 0 });
  };

  const calloutItems = CALLOUT_TYPES.map(type => ({
    label: type,
    action: () => insertCallout(type),
  }));

  return (
    <GroupShell name="Blocks" dataGroup="Blocks">
      <div className="onr-group-buttons">
        <RibbonButton
          data-cmd="insert-template"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="5" rx="1"/>
              <rect x="3" y="12" width="4" height="9" rx="1"/>
              <rect x="11" y="12" width="10" height="9" rx="1"/>
            </svg>
          }
          label="Template"
          onClick={insertTemplate}
        />
        <div ref={calloutRef}>
          <RibbonButton
            data-cmd="insert-callout"
            className="onr-btn"
            icon={
              <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l19-9v18L3 13"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
              </svg>
            }
            label="Callout"
            onClick={() => setCalloutAnchor(calloutRef.current)}
          />
        </div>
        <RibbonButton
          data-cmd="insert-code-block"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          }
          label="Code Block"
          onClick={insertCodeBlock}
        />
      </div>

      {calloutAnchor && (
        <Dropdown anchor={calloutAnchor} items={calloutItems} onClose={() => setCalloutAnchor(null)} />
      )}
    </GroupShell>
  );
}
