import { useApp } from '../../../shared/context/AppContext';
import { BacklinksIcon, OutgoingLinksIcon, LocalGraphIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function LinksNotesGroup() {
  const app = useApp();

  const handleBacklinks = () => {
    (app as any).commands.executeCommandById('backlink:open');
  };

  const handleOutgoingLinks = () => {
    (app as any).commands.executeCommandById('outgoing-links:open');
  };

  const handleLocalGraph = () => {
    (app as any).commands.executeCommandById('graph:open-local');
  };

  return (
    <GroupShell name="Links">
      <div className="onr-links-notes-group">
        <RibbonButton
          size="large"
          icon={<BacklinksIcon className="onr-icon" />}
          label="Backlinks"
          title="Open backlinks panel"
          onClick={handleBacklinks}
          data-cmd="backlinks"
        />
        <RibbonButton
          size="large"
          icon={<OutgoingLinksIcon className="onr-icon" />}
          label="Outgoing Links"
          title="Open outgoing links panel"
          onClick={handleOutgoingLinks}
          data-cmd="outgoing-links"
        />
        <RibbonButton
          size="large"
          icon={<LocalGraphIcon className="onr-icon" />}
          label="Local Graph"
          title="Open local graph view"
          onClick={handleLocalGraph}
          data-cmd="local-graph"
        />
      </div>
    </GroupShell>
  );
}
