import { useApp } from '../../../shared/context/AppContext';
import { LinkIcon, WikiLinkIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function LinksGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleLink = () => {
    const editor = getEditor();
    if (!editor) return;
    const sel = editor.getSelection();
    editor.replaceSelection(sel ? `[${sel}](url)` : '[link text](url)');
  };

  const handleWikiLink = () => {
    const editor = getEditor();
    if (!editor) return;
    const sel = editor.getSelection();
    editor.replaceSelection(sel ? `[[${sel}]]` : '[[note name]]');
  };

  return (
    <GroupShell name="Links">
      <div className="onr-links-group">
        <RibbonButton
          size="large"
          icon={<LinkIcon className="onr-icon" />}
          label="Link"
          title="Insert markdown link"
          onClick={handleLink}
          data-cmd="insert-link"
        />
        <RibbonButton
          size="large"
          icon={<WikiLinkIcon className="onr-icon" />}
          label="Wikilink"
          title="Insert internal wikilink"
          onClick={handleWikiLink}
          data-cmd="insert-wikilink"
        />
      </div>
    </GroupShell>
  );
}
