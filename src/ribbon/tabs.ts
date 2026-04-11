export const TABS = ['Home', 'Insert', 'Draw', 'History', 'Review', 'View', 'Help'] as const;
export type TabName = (typeof TABS)[number];
