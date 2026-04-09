import React from "react";
import { render, screen } from "@testing-library/react";
import { renderWithApp } from "../../../test-utils/renderWithApp";
import { createMockApp } from "../../../test-utils/mockApp";
import { InsertTabPanel } from "../InsertTabPanel";

describe("InsertTabPanel — rendering", () => {
  it("renders without crashing", () => {
    const app = createMockApp();
    renderWithApp(<InsertTabPanel />, app);
    expect(screen.getByText("Blank Line")).toBeInTheDocument();
  });

  it("renders all Insert tab groups", () => {
    const app = createMockApp();
    renderWithApp(<InsertTabPanel />, app);
    expect(screen.getByText("Table")).toBeInTheDocument();
    expect(screen.getByText("Attach File")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Link")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Code Block")).toBeInTheDocument();
    expect(screen.getByText("Math $$")).toBeInTheDocument();
  });
});
