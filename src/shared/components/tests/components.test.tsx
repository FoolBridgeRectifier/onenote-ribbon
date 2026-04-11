import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { RibbonButton } from "../RibbonButton";
import { GroupShell } from "../GroupShell";
import { useFormatPainter } from "../../hooks/useFormatPainter";

// ── RibbonButton ─────────────────────────────────────────────────────────────

describe("RibbonButton — rendering", () => {
  it("renders label and calls onClick", () => {
    const onClick = jest.fn();
    render(<RibbonButton label="Click Me" onClick={onClick} />);
    fireEvent.click(screen.getByText("Click Me"));
    expect(onClick).toHaveBeenCalled();
  });

  it("applies data-cmd attribute", () => {
    const { container } = render(
      <RibbonButton label="Btn" data-cmd="my-cmd" onClick={() => {}} />
    );
    expect(container.querySelector('[data-cmd="my-cmd"]')).not.toBeNull();
  });

  it("adds onr-active class when active=true", () => {
    const { container } = render(
      <RibbonButton label="Btn" active={true} onClick={() => {}} />
    );
    expect(container.firstChild).toHaveClass("onr-active");
  });

  it("does not add onr-active when active=false", () => {
    const { container } = render(
      <RibbonButton label="Btn" active={false} onClick={() => {}} />
    );
    expect(container.firstChild).not.toHaveClass("onr-active");
  });

  it("adds onr-disabled class when disabled=true", () => {
    const { container } = render(
      <RibbonButton label="Btn" disabled={true} onClick={() => {}} />
    );
    expect(container.firstChild).toHaveClass("onr-disabled");
  });


  it("renders icon children", () => {
    const { container } = render(
      <RibbonButton icon={<svg data-testid="icon" />} label="Btn" onClick={() => {}} />
    );
    expect(container.querySelector("[data-testid='icon']")).not.toBeNull();
  });
});

// ── GroupShell ───────────────────────────────────────────────────────────────

describe("GroupShell — rendering", () => {
  it("renders group name label", () => {
    render(
      <GroupShell name="Test Group" dataGroup="test">
        <span>child content</span>
      </GroupShell>
    );
    expect(screen.getByText("Test Group")).toBeInTheDocument();
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("sets data-group attribute", () => {
    const { container } = render(
      <GroupShell name="X" dataGroup="my-group">
        <span />
      </GroupShell>
    );
    expect(container.querySelector('[data-group="my-group"]')).not.toBeNull();
  });
});

// ── useFormatPainter ─────────────────────────────────────────────────────────

describe("useFormatPainter — hook", () => {
  it("starts inactive with no format", () => {
    const { result } = renderHook(() => useFormatPainter());
    expect(result.current.isActive).toBe(false);
    expect(result.current.format).toBeNull();
  });

  it("setFormat and setIsActive update state", () => {
    const { result } = renderHook(() => useFormatPainter());
    const fmt = { prefix: "**", suffix: "**" };
    act(() => result.current.setFormat(fmt));
    act(() => result.current.setIsActive(true));
    expect(result.current.isActive).toBe(true);
    expect(result.current.format).toEqual(fmt);
  });

  it("setFormat(null) clears format", () => {
    const { result } = renderHook(() => useFormatPainter());
    const fmt = { prefix: "**", suffix: "**" };
    act(() => result.current.setFormat(fmt));
    act(() => result.current.setFormat(null));
    act(() => result.current.setIsActive(false));
    expect(result.current.isActive).toBe(false);
    expect(result.current.format).toBeNull();
  });
});
