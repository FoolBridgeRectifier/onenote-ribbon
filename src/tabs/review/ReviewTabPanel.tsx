import './review-tab-panel.css';
import { SpellingGroup } from './spelling/SpellingGroup';
import { LinksNotesGroup } from './links-notes/LinksNotesGroup';
import { PropertiesGroup } from './properties/PropertiesGroup';
import { SecurityGroup } from './security/SecurityGroup';

export function ReviewTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="Review">
      <SpellingGroup />
      <LinksNotesGroup />
      <PropertiesGroup />
      <SecurityGroup />
    </div>
  );
}
