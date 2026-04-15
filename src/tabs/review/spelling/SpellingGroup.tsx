import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { SpellcheckIcon, LintNoteIcon, TranslateIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

function isPluginEnabled(app: any, pluginId: string): boolean {
  return !!(app as any).plugins?.enabledPlugins?.has(pluginId);
}

export function SpellingGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleSpellcheck = () => {
    (app as any).commands.executeCommandById('editor:toggle-spellcheck');
  };

  const handleLintNote = () => {
    if (!isPluginEnabled(app, 'obsidian-linter')) {
      new Notice('Install "Linter" plugin to use this feature');
      (app as any).setting?.open?.();
      (app as any).setting?.openTabById?.('community-plugins');
      return;
    }
    (app as any).commands.executeCommandById('obsidian-linter:lint-file');
  };

  const handleTranslate = () => {
    const editor = getEditor();
    const selection = editor?.getSelection() ?? '';
    window.open(
      `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(selection)}&op=translate`,
    );
  };

  const lintAvailable = isPluginEnabled(app, 'obsidian-linter');

  return (
    <GroupShell name="Spelling &amp; Language">
      <div className="onr-spelling-group">
        <RibbonButton
          size="large"
          icon={<SpellcheckIcon className="onr-icon" />}
          label="Spellcheck"
          title="Toggle spellcheck"
          onClick={handleSpellcheck}
          data-cmd="spellcheck"
        />
        <RibbonButton
          size="large"
          icon={<LintNoteIcon className="onr-icon" />}
          label="Lint Note"
          title="Lint current file (Linter plugin)"
          onClick={handleLintNote}
          data-cmd="lint-note"
          className={lintAvailable ? '' : 'onr-btn-plugin-unavailable'}
        >
          <LintNoteIcon className="onr-icon" />
          <span className="onr-btn-label">Lint Note</span>
          {!lintAvailable && <span className="onr-plugin-badge">plugin</span>}
        </RibbonButton>
        <RibbonButton
          size="large"
          icon={<TranslateIcon className="onr-icon" />}
          label="Translate"
          title="Translate selection in Google Translate"
          onClick={handleTranslate}
          data-cmd="translate"
        />
      </div>
    </GroupShell>
  );
}
