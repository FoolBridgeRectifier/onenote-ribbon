import { useApp } from '../../../shared/context/AppContext';
import { PropertiesIcon, TagsPaneIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function PropertiesGroup() {
  const app = useApp();

  const handleProperties = () => {
    (app as any).commands.executeCommandById('editor:open-file-properties');
  };

  const handleTagsPane = () => {
    (app as any).commands.executeCommandById('tag-pane:open');
  };

  return (
    <GroupShell name="Properties">
      <div className="onr-properties-group">
        <RibbonButton
          size="large"
          icon={<PropertiesIcon className="onr-icon" />}
          label="Properties"
          title="Open file properties"
          onClick={handleProperties}
          data-cmd="properties"
        />
        <RibbonButton
          size="large"
          icon={<TagsPaneIcon className="onr-icon" />}
          label="Tags Pane"
          title="Open tags pane"
          onClick={handleTagsPane}
          data-cmd="tags-pane"
        />
      </div>
    </GroupShell>
  );
}
