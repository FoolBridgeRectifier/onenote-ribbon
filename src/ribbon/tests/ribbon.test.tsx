import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { AppContext } from "../../shared/context/AppContext";
import { FormatPainterContext } from "../../shared/context/FormatPainterContext";
import { createMockApp } from "../../test-utils/mockApp";
import { TABS, TabName } from "../tabs";
import { useRibbonState } from "../useRibbonState";
import { TabBar } from "../TabBar";
import { RibbonApp } from "../RibbonApp";

// ── tabs.ts ──────────────────────────────────────────────────────────────────

describe("tabs — TABS constant", () => {
  it("exports 7 tab names", () => expect(TABS).toHaveLength(7));
  it("first tab is Home", () => expect(TABS[0]).toBe("Home"));
  it("includes Insert", () => expect(TABS).toContain("Insert"));
  it("includes Draw, History, Review, View, Help", () => {
    expect(TABS).toContain("Draw");
    expect(TABS).toContain("History");
    expect(TABS).toContain("Review");
    expect(TABS).toContain("View");
    expect(TABS).toContain("Help");
  });
});

// ── useRibbonState ───────────────────────────────────────────────────────────

describe("useRibbonState — initial state", () => {
  it("activeTab defaults to Home", () => {
    const { result } = renderHook(() => useRibbonState());
    expect(result.current.activeTab).toBe("Home");
  });

  it("collapsed defaults to false", () => {
    const { result } = renderHook(() => useRibbonState());
    expect(result.current.collapsed).toBe(false);
  });

  it("pinned defaults to true", () => {
    const { result } = renderHook(() => useRibbonState());
    expect(result.current.pinned).toBe(true);
  });

  it("setActiveTab updates activeTab", () => {
    const { result } = renderHook(() => useRibbonState());
    act(() => result.current.setActiveTab("Insert"));
    expect(result.current.activeTab).toBe("Insert");
  });

  it("setCollapsed toggles collapsed", () => {
    const { result } = renderHook(() => useRibbonState());
    act(() => result.current.setCollapsed(true));
    expect(result.current.collapsed).toBe(true);
  });

  it("setPinned toggles pinned", () => {
    const { result } = renderHook(() => useRibbonState());
    act(() => result.current.setPinned(false));
    expect(result.current.pinned).toBe(false);
  });
});

// ── TabBar ───────────────────────────────────────────────────────────────────

describe("TabBar — rendering", () => {
  const noop = () => {};
  function renderTabBar(activeTab: TabName = "Home", collapsed = false, pinned = true) {
    return render(
      <TabBar
        activeTab={activeTab}
        collapsed={collapsed}
        pinned={pinned}
        onTabClick={noop}
        onToggleCollapse={noop}
      />
    );
  }

  it("renders all 7 tabs", () => {
    renderTabBar();
    for (const t of TABS) expect(screen.getByText(t)).toBeInTheDocument();
  });

  it("active tab has 'active' class", () => {
    renderTabBar("Insert");
    const insertTab = screen.getByText("Insert");
    expect(insertTab.className).toContain("active");
  });

  it("inactive tabs do not have 'active' class", () => {
    renderTabBar("Home");
    const insertTab = screen.getByText("Insert");
    expect(insertTab.className).not.toContain("active");
  });

  it("fires onTabClick when tab clicked", () => {
    const onTabClick = jest.fn();
    render(
      <TabBar
        activeTab="Home"
        collapsed={false}
        pinned={false}
        onTabClick={onTabClick}
        onToggleCollapse={noop}
      />
    );
    fireEvent.click(screen.getByText("Insert"));
    expect(onTabClick).toHaveBeenCalledWith("Insert");
  });

  it("shows Collapse when not collapsed", () => {
    renderTabBar("Home", false);
    expect(screen.getByText(/Collapse/)).toBeInTheDocument();
  });

  it("shows Expand when collapsed", () => {
    renderTabBar("Home", true);
    expect(screen.getByText(/Expand/)).toBeInTheDocument();
  });

  it("fires onToggleCollapse when pin button clicked", () => {
    const onToggle = jest.fn();
    render(
      <TabBar
        activeTab="Home"
        collapsed={false}
        pinned={false}
        onTabClick={noop}
        onToggleCollapse={onToggle}
      />
    );
    fireEvent.click(screen.getByText(/Collapse/));
    expect(onToggle).toHaveBeenCalled();
  });
});

// ── RibbonApp ────────────────────────────────────────────────────────────────

function renderRibbonApp() {
  const app = createMockApp();
  const fp = {
    active: false,
    format: null,
    capture: () => {},
    clear: () => {},
  };
  return render(
    <AppContext.Provider value={app as any}>
      <FormatPainterContext.Provider value={fp}>
        <RibbonApp />
      </FormatPainterContext.Provider>
    </AppContext.Provider>
  );
}

describe("RibbonApp — rendering", () => {
  it("renders the ribbon with tab bar", () => {
    renderRibbonApp();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Insert")).toBeInTheDocument();
  });

  it("shows Home tab panel by default", () => {
    renderRibbonApp();
    // Home panel renders Clipboard group
    expect(screen.getByText("Paste")).toBeInTheDocument();
  });

  it("clicking Insert tab switches to Insert panel", () => {
    renderRibbonApp();
    fireEvent.click(screen.getByText("Insert"));
    expect(screen.getByText("Blank Line")).toBeInTheDocument();
  });

  it("Collapse button hides body", () => {
    renderRibbonApp();
    fireEvent.click(screen.getByText(/Collapse/));
    expect(screen.queryByText("Paste")).not.toBeInTheDocument();
  });
});
