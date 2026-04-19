import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Plugin } from 'obsidian';
import { AppContext, AppWithCommands } from '../shared/context/AppContext';
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
    // MockApp satisfies the App interface surface used by components at runtime.
    const appProvided = (
      <AppContext.Provider value={app as unknown as AppWithCommands}>
        {children}
      </AppContext.Provider>
    );

    if (plugin) {
      // MockPlugin satisfies the Plugin interface surface used by hooks at runtime.
      return (
        <PluginContext.Provider value={plugin as unknown as Plugin}>
          {appProvided}
        </PluginContext.Provider>
      );
    }

    return appProvided;
  };

  return render(component, { wrapper, ...renderOptions });
}

