import type { TagOrSeparator } from '../../../interfaces';
import {
  TAG_FILL_MEDIUM_GRAY,
  TAG_FILL_PROJECT_A_CORAL,
  TAG_FILL_PROJECT_B_GOLD,
  TAG_FILL_PRIORITY_1_RED,
  TAG_FILL_PRIORITY_2_BLUE,
  TAG_SWATCH_NEUTRAL,
  TAG_SWATCH_PROJECT_A,
  TAG_SWATCH_PROJECT_B,
  TAG_SWATCH_PRIORITY_1,
  TAG_SWATCH_PRIORITY_2,
} from '../../../constants';
import { TagIconText } from '../../../../../../assets/tag-icons/basic-icons/BasicIcons';
import {
  MovieTagIcon,
  BookTagIcon,
  MusicTagIcon,
} from '../../../../../../assets/tag-icons/extended-icons/ExtendedIcons';
import {
  DocumentTagIcon,
  PriorityTodoIcon,
} from '../../../../../../assets/tag-icons/special-icons/SpecialIcons';

/** Second section of the callout tag list (Project A through To Do priority 2). */
export const CALLOUT_TAGS_B: TagOrSeparator[] = [
  {
    label: 'Project A',
    icon: <TagIconText fill={TAG_FILL_PROJECT_A_CORAL} symbol="A" />,
    swatchColor: TAG_SWATCH_PROJECT_A,
    action: { type: 'callout', calloutType: 'example', calloutTitle: 'Project A' },
    calloutKey: 'Project A',
  },
  {
    label: 'Project B',
    icon: <TagIconText fill={TAG_FILL_PROJECT_B_GOLD} symbol="B" />,
    swatchColor: TAG_SWATCH_PROJECT_B,
    action: { type: 'callout', calloutType: 'success', calloutTitle: 'Project B' },
    calloutKey: 'Project B',
  },
  {
    label: 'Movie to see',
    icon: <MovieTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Movie to see' },
    calloutKey: 'Movie to see',
  },
  {
    label: 'Book to read',
    icon: <BookTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Book to read' },
    calloutKey: 'Book to read',
  },
  {
    label: 'Music to listen to',
    icon: <MusicTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Music to listen to' },
    calloutKey: 'Music to listen to',
  },
  {
    label: 'Source for article',
    icon: <DocumentTagIcon fill={TAG_FILL_MEDIUM_GRAY} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'quote', calloutTitle: 'Source for article' },
    calloutKey: 'Source for article',
  },
  {
    label: 'Remember for blog',
    icon: <DocumentTagIcon fill={TAG_FILL_MEDIUM_GRAY} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'note', calloutTitle: 'Remember for blog' },
    calloutKey: 'Remember for blog',
  },
  {
    label: 'To Do priority 1',
    icon: <PriorityTodoIcon fill={TAG_FILL_PRIORITY_1_RED} />,
    swatchColor: TAG_SWATCH_PRIORITY_1,
    action: { type: 'callout', calloutType: 'todo', calloutTitle: 'To Do priority 1' },
    calloutKey: 'To Do priority 1',
  },
  {
    label: 'To Do priority 2',
    icon: <PriorityTodoIcon fill={TAG_FILL_PRIORITY_2_BLUE} />,
    swatchColor: TAG_SWATCH_PRIORITY_2,
    action: { type: 'callout', calloutType: 'todo', calloutTitle: 'To Do priority 2' },
    calloutKey: 'To Do priority 2',
  },
];
