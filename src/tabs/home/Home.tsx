import './home-tab-panel.css';
import { ClipboardGroup } from './clipboard/Clipboard';
import { BasicTextGroup } from './basic-text/BasicText';
import { StylesGroup } from './styles/Styles';
import { TagsGroup } from './tags/Tags';
import { EmailGroup } from './email/Email';
import { NavigateGroup } from './navigate/Navigate';

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
