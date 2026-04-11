import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppContext } from '../shared/context/AppContext';
import { FormatPainterContext } from '../shared/context/FormatPainterContext';
import type { MockApp } from './mockApp';

interface RenderWithAppOptions extends Omit<RenderOptions, 'wrapper'> {
  formatPainter?: any;
}

export function renderWithApp(
  component: React.ReactElement,
  app: MockApp,
  options?: RenderWithAppOptions,
) {
  const { formatPainter, ...renderOptions } = options || {};

  const defaultFormatPainter = {
    isActive: false,
    format: null,
    setIsActive: () => {},
    setFormat: () => {},
    apply: () => {},
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppContext.Provider value={app as any}>
      <FormatPainterContext.Provider value={formatPainter ?? defaultFormatPainter}>
        {children}
      </FormatPainterContext.Provider>
    </AppContext.Provider>
  );

  return render(component, { wrapper, ...renderOptions });
}
