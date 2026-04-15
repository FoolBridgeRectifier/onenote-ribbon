import { Modal } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { HelpDocsIcon, CommunityForumIcon, GithubIcon, AboutIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function HelpGroup() {
  const app = useApp();

  const handleHelpDocs = () => {
    window.open('https://help.obsidian.md');
  };

  const handleCommunityForum = () => {
    window.open('https://forum.obsidian.md');
  };

  const handleGithub = () => {
    window.open('https://github.com/obsidianmd/obsidian-releases');
  };

  const handleAbout = () => {
    const modal = new Modal(app);
    modal.titleEl.setText('OneNote Ribbon');
    modal.contentEl.createEl('p', { text: 'A faithful OneNote-style ribbon UI for Obsidian.' });
    modal.contentEl.createEl('p', { text: `Obsidian: ${(app as any).version ?? 'unknown'}` });
    modal.open();
  };

  return (
    <GroupShell name="Help">
      <div className="onr-help-group">
        <RibbonButton
          size="large"
          icon={<HelpDocsIcon className="onr-icon" />}
          label="Help Docs"
          title="Open Obsidian help documentation"
          onClick={handleHelpDocs}
          data-cmd="help-docs"
        />
        <RibbonButton
          size="large"
          icon={<CommunityForumIcon className="onr-icon" />}
          label="Forum"
          title="Open Obsidian community forum"
          onClick={handleCommunityForum}
          data-cmd="community-forum"
        />
        <RibbonButton
          size="large"
          icon={<GithubIcon className="onr-icon" />}
          label="GitHub"
          title="Open Obsidian GitHub repository"
          onClick={handleGithub}
          data-cmd="github"
        />
        <RibbonButton
          size="large"
          icon={<AboutIcon className="onr-icon" />}
          label="About"
          title="About OneNote Ribbon"
          onClick={handleAbout}
          data-cmd="about"
        />
      </div>
    </GroupShell>
  );
}
