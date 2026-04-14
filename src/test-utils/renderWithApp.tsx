import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppContext } from '../shared/context/AppContext';
import { PluginContext } from '../shared/context/PluginContext';
import type { MockApp, MockPlugin } from './mockApp';

type RenderWithAppOptions = Omit<RenderOptions, 'wrapper'> & {
  plugin?: MockPlugin;
};

export function renderWithApp(
  component: React.ReactElement,
  app: MockApp,
  options?: RenderWithAppOptions,
) {
  const { plugin, ...renderOptions } = options ?? {};

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const appProvided = (
      <AppContext.Provider value={app as any}>
        {children}
      </AppContext.Provider>
    );

    if (plugin) {
      return (
        <PluginContext.Provider value={plugin as any}>
          {appProvided}
        </PluginContext.Provider>
      );
    }

    return appProvided;
  };

  return render(component, { wrapper, ...renderOptions });
}

