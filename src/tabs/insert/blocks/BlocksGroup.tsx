import { useRef, useState } from 'react';

import './blocks-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { TemplateIcon, CalloutIcon, CodeBlockIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { Dropdown } from '../../../shared/components/dropdown/Dropdown';

const CALLOUT_TYPES = [
  { label: 'Note', type: 'note' },
  { label: 'Info', type: 'info' },
  { label: 'Tip', type: 'tip' },
  { label: 'Warning', type: 'warning' },
  { label: 'Danger', type: 'danger' },
  { label: 'Error', type: 'error' },
  { label: 'Success', type: 'success' },
  { label: 'Question', type: 'question' },
  { label: 'Important', type: 'important' },
  { label: 'Abstract', type: 'abstract' },
  { label: 'Bug', type: 'bug' },
  { label: 'Example', type: 'example' },
];

export function BlocksGroup() {
  const app = useApp();
  const calloutButtonRef = useRef<HTMLDivElement>(null);
  const [calloutMenuOpen, setCalloutMenuOpen] = useState(false);
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleTemplate = () => {
    (app as any).commands.executeCommandById('templater-obsidian:insert-templater');
  };

  const handleCalloutSelect = (calloutType: string) => {
    const editor = getEditor();
    if (!editor) return;
    const sel = editor.getSelection();
    const body = sel || 'Content';
    editor.replaceSelection(`> [!${calloutType}]\n> ${body}`);
    setCalloutMenuOpen(false);
  };

  const handleCodeBlock = () => {
    const editor = getEditor();
    if (!editor) return;
    const sel = editor.getSelection();
    editor.replaceSelection(sel ? `\`\`\`\n${sel}\n\`\`\`` : '```\n\n```');
  };

  const calloutItems = CALLOUT_TYPES.map((ct) => ({
    label: ct.label,
    onClick: () => handleCalloutSelect(ct.type),
  }));

  return (
    <GroupShell name="Blocks">
      <div className="onr-blocks-group">
        <RibbonButton
          size="large"
          icon={<TemplateIcon className="onr-icon" />}
          label="Template"
          title="Insert a template (Templater)"
          onClick={handleTemplate}
          data-cmd="insert-template"
        />
        <div className="onr-blocks-callout-wrap">
          <RibbonButton
            ref={calloutButtonRef}
            size="large"
            icon={<CalloutIcon className="onr-icon" />}
            label="Callout"
            title="Insert a callout block"
            onClick={() => setCalloutMenuOpen(!calloutMenuOpen)}
            data-cmd="insert-callout"
          />
          {calloutMenuOpen && calloutButtonRef.current && (
            <Dropdown
              anchor={calloutButtonRef.current}
              items={calloutItems}
              onClose={() => setCalloutMenuOpen(false)}
            />
          )}
        </div>
        <RibbonButton
          size="large"
          icon={<CodeBlockIcon className="onr-icon" />}
          label="Code Block"
          title="Insert a fenced code block"
          onClick={handleCodeBlock}
          data-cmd="insert-code-block"
        />
      </div>
    </GroupShell>
  );
}
