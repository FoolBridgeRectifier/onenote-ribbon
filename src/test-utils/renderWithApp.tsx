import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppContext } from '../shared/context/AppContext';
import type { MockApp } from './mockApp';

type RenderWithAppOptions = Omit<RenderOptions, 'wrapper'>;

export function renderWithApp(
  component: React.ReactElement,
  app: MockApp,
  options?: RenderWithAppOptions,
) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppContext.Provider value={app as any}>{children}</AppContext.Provider>
  );

  return render(component, { wrapper, ...(options ?? {}) });
}
