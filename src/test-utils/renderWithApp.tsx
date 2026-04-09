import React, { useState } from "react";
import { render, RenderResult } from "@testing-library/react";

import { AppContext } from "../shared/context/AppContext";
import { FormatPainterContext, FormatPainterContextValue } from "../shared/context/FormatPainterContext";
import { MockApp } from "./mockApp";

const DEFAULT_FORMAT_PAINTER_STATE: FormatPainterContextValue = {
  active: false,
  format: null,
  capture: () => {},
  clear: () => {},
};

interface WrapperProps {
  app: MockApp;
  children: React.ReactNode;
}

function Wrapper({ app, children }: WrapperProps) {
  const [formatPainterState, setFormatPainterState] = useState<FormatPainterContextValue>(DEFAULT_FORMAT_PAINTER_STATE);

  const formatPainterValue = {
    ...formatPainterState,
    capture: (newFormat: any) =>
      setFormatPainterState({
        active: true,
        format: newFormat,
        capture: formatPainterValue.capture,
        clear: formatPainterValue.clear,
      }),
    clear: () =>
      setFormatPainterState({ ...DEFAULT_FORMAT_PAINTER_STATE, capture: formatPainterValue.capture, clear: formatPainterValue.clear }),
  };

  return (
    <AppContext.Provider value={app as any}>
      <FormatPainterContext.Provider value={formatPainterValue}>
        {children}
      </FormatPainterContext.Provider>
    </AppContext.Provider>
  );
}

/**
 * Renders a React component wrapped in AppContext + FormatPainterContext.
 * All Home tab components need this wrapper in integration tests.
 */
export function renderWithApp(
  ui: React.ReactElement,
  app: MockApp,
): RenderResult {
  return render(<Wrapper app={app}>{ui}</Wrapper>);
}
