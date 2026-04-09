import { useState, useRef } from 'react';

import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';
import { Dropdown } from '../../../shared/components/Dropdown';
import { EditorState } from '../../../shared/hooks/useEditorState';
import { ALL_TAGS, tagNotation } from './tags-data';
import { applyTag } from './tag-apply/applyTag';
import { toggleLinePrefix } from '../../../shared/toggleLinePrefix';

interface Props { editorState: EditorState }

export function TagsGroup({ editorState: _editorState }: Props) {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;
  const [ddAnchor, setDdAnchor] = useState<HTMLElement | null>(null);
  const ddRef = useRef<HTMLDivElement>(null);

  const top3 = ALL_TAGS.slice(0, 3);

  const isTagActive = (cmd: string) => {
    const editor = getEditor(); if (!editor) return false;
    const line = editor.getLine(editor.getCursor().line);
    const notation = tagNotation(cmd);
    return !!notation && line.includes(notation.split('\n')[0].trim());
  };

  const openTagSearch = () => {
    (app as any).commands.executeCommandById('global-search:open');
    setTimeout(() => {
      const input = document.querySelector('.search-input-container input') as HTMLInputElement;
      if (input) {
        input.value = '#';
        input.dispatchEvent(new Event('input'));
      }
    }, 300);
  };

  const ddItems = ALL_TAGS.map(tag => ({
    label: tag.label,
    action: () => { const editor = getEditor(); if (editor) applyTag(tag.cmd, editor); },
  }));

  return (
    <GroupShell name="Tags" dataGroup="Tags">
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, width: 150 }}>
          {top3.map(tag => {
            const active = isTagActive(tag.cmd);
            return (
              <div key={tag.cmd} className="onr-tag-row onr-btn-sm" data-cmd={tag.cmd}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseDown={event => { event.preventDefault(); event.stopPropagation(); }}
                onClick={() => { const editor = getEditor(); if (editor) applyTag(tag.cmd, editor); }}
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

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 64 }}>
          <div ref={ddRef}>
            <RibbonButton label="▾" data-cmd="tags-dropdown"
              style={{ width: 14, minHeight: 64, padding: 0, fontSize: 9, justifyContent: 'center' }}
              onClick={() => setDdAnchor(ddRef.current)}
            />
          </div>
        </div>

        <RibbonButton label="☐ Todo" data-cmd="todo-tag"
          onClick={() => { const editor = getEditor(); if (editor) toggleLinePrefix(editor, '- [ ] '); }}
        />
        <RibbonButton label="🔍 Find Tags" data-cmd="find-tags" onClick={openTagSearch} />
      </div>

      {ddAnchor && (
        <Dropdown anchor={ddAnchor} items={ddItems} onClose={() => setDdAnchor(null)} />
      )}
    </GroupShell>
  );
}
