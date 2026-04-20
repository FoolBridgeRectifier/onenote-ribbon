import { ImportantTagIcon, QuestionTagIcon } from '../../../../../../assets/icons';
import type { TagOrSeparator } from '../../../interfaces';
import {
  TAG_FILL_DARK,
  TAG_FILL_DEFINITION_GREEN,
  TAG_FILL_MEDIUM_GRAY,
  TAG_FILL_CRITICAL_RED,
  TAG_SWATCH_IMPORTANT,
  TAG_SWATCH_QUESTION,
  TAG_SWATCH_REMEMBER,
  TAG_SWATCH_DEFINITION,
  TAG_SWATCH_NEUTRAL,
  TAG_SWATCH_CRITICAL,
} from '../../../constants';
import {
  TagIconText,
  PersonTagIcon,
  AddressTagIcon,
  PhoneTagIcon,
  GlobeTagIcon,
} from '../../tag-icons/basic-icons/BasicIcons';
import { IdeaTagIcon, LockTagIcon } from '../../tag-icons/extended-icons/ExtendedIcons';

/** First section of the callout tag list (Important through Critical). */
export const CALLOUT_TAGS_A: TagOrSeparator[] = [
  {
    label: 'Important',
    icon: <ImportantTagIcon className="onr-tag-dd-icon-svg" />,
    swatchColor: TAG_SWATCH_IMPORTANT,
    action: { type: 'callout', calloutType: 'important', calloutTitle: 'Important' },
    calloutKey: 'Important',
  },
  {
    label: 'Question',
    icon: <QuestionTagIcon className="onr-tag-dd-icon-svg" />,
    swatchColor: TAG_SWATCH_QUESTION,
    action: { type: 'callout', calloutType: 'question', calloutTitle: 'Question' },
    calloutKey: 'Question',
  },
  {
    label: 'Remember for later',
    icon: <TagIconText fill={TAG_FILL_DARK} symbol="R" />,
    swatchColor: TAG_SWATCH_REMEMBER,
    action: { type: 'callout', calloutType: 'note', calloutTitle: 'Remember for later' },
    calloutKey: 'Remember for later',
  },
  {
    label: 'Definition',
    icon: <TagIconText fill={TAG_FILL_DEFINITION_GREEN} symbol="D" />,
    swatchColor: TAG_SWATCH_DEFINITION,
    action: { type: 'callout', calloutType: 'abstract', calloutTitle: 'Definition' },
    calloutKey: 'Definition',
  },
  {
    label: 'Contact',
    icon: <PersonTagIcon fill={TAG_FILL_MEDIUM_GRAY} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'info', calloutTitle: 'Contact' },
    calloutKey: 'Contact',
  },
  {
    label: 'Address',
    icon: <AddressTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'info', calloutTitle: 'Address' },
    calloutKey: 'Address',
  },
  {
    label: 'Phone number',
    icon: <PhoneTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'info', calloutTitle: 'Phone number' },
    calloutKey: 'Phone number',
  },
  {
    label: 'Web site to visit',
    icon: <GlobeTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Web site to visit' },
    calloutKey: 'Web site to visit',
  },
  {
    label: 'Idea',
    icon: <IdeaTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Idea' },
    calloutKey: 'Idea',
  },
  {
    label: 'Password',
    icon: <LockTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'warning', calloutTitle: 'Password' },
    calloutKey: 'Password',
  },
  {
    label: 'Critical',
    icon: <TagIconText fill={TAG_FILL_CRITICAL_RED} symbol="!" />,
    swatchColor: TAG_SWATCH_CRITICAL,
    action: { type: 'callout', calloutType: 'danger', calloutTitle: 'Critical' },
    calloutKey: 'Critical',
  },
];
