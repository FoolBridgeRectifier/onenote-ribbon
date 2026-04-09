import { useState } from "react";

import { TabName } from "./tabs";

export function useRibbonState() {
  const [activeTab, setActiveTab] = useState<TabName>("Home");
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  return { activeTab, setActiveTab, collapsed, setCollapsed, pinned, setPinned };
}
