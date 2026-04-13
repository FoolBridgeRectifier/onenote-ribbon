import './home-tab-panel.css';
import { ClipboardGroup } from './clipboard/ClipboardGroup';
import { BasicTextGroup } from './basic-text/BasicTextGroup';
import { StylesGroup } from './styles/StylesGroup';
import { TagsGroup } from './tags/TagsGroup';
import { EmailGroup } from './email/EmailGroup';
import { NavigateGroup } from './navigate/NavigateGroup';

export function HomeTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="Home">
      <ClipboardGroup />
      <BasicTextGroup />
      <StylesGroup />
      <TagsGroup />
      <EmailGroup />
      <NavigateGroup />
    </div>
  );
}
